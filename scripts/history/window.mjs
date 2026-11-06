import { KINDS, MODULE_ID, TEMPLATES } from "../constants.mjs";
import { localize } from "../utils.mjs";
import { isMasterVoice, isTalk, resolveKind } from "../chat/kinds.mjs";
import { speakerImage, speakerToken } from "../chat/speaker.mjs";
import { parseMarkup } from "../chat/usage-item.mjs";
import { isCurrentScene, talkScene, talkSince } from "./scene.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const WINDOW_ID = "tbg-history";
const TOOL_NAME = "tbgHistory";
const ICON = "fa-solid fa-comments";
const MASTER_ICON = "fa-solid fa-crown";
const NARRATOR_ICON = "fa-solid fa-scroll";
const MAX_LINES = 500;
const BOTTOM_SLACK = 24;
const REFRESH_MS = 80;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Recortes do histórico: a cena que se está vendo ou, só para o Mestre, todas. */
const SCOPES = Object.freeze({ SCENE: "scene", ALL: "all" });

/** Botão do Mercado da Eternia: o do histórico entra logo abaixo dele. */
const ANCHOR_TOOL = "eterniaMarket";

/**
 * O histórico da cena: a conversa da cena que se está vendo, da mais antiga à mais nova, para quem se distraiu ou
 * chegou depois. Acompanha as mensagens ao vivo e desce sozinho quando já estava no fim. O do jogador começa na
 * última vez que o Mestre ativou a cena; o do Mestre guarda tudo, pode mostrar todas as cenas e se exporta em JSON.
 */
class SceneHistory extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: WINDOW_ID,
    classes: ["tbg-history"],
    window: { title: "TBG.History.title", icon: ICON, resizable: true },
    position: { width: 400, height: 480, left: 120, top: 110 },
    actions: {
      pan: SceneHistory.#onPan,
      scope: SceneHistory.#onScope,
      export: SceneHistory.#onExport,
      select: SceneHistory.#onSelect,
      pick: SceneHistory.#onPick,
      pickAll: SceneHistory.#onPickAll,
      pickDay: SceneHistory.#onPickDay,
      pickNone: SceneHistory.#onPickNone,
      erase: SceneHistory.#onErase
    }
  };

  static PARTS = {
    log: { template: TEMPLATES.history, scrollable: [".tbg-history__log"] }
  };

  /** Abre a janela ou, se já está aberta, fecha. */
  static toggle() {
    const open = foundry.applications.instances.get(WINDOW_ID);
    if (open) return open.close();
    return new SceneHistory().render({ force: true });
  }

  #texts = new Map();
  #stickToBottom = true;
  #scope = SCOPES.SCENE;
  #isSelecting = false;
  #selected = new Set();
  #lastPicked = null;

  refresh = foundry.utils.debounce(() => this.render(), REFRESH_MS);

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const messages = historyMessages(this.#scope);
    const shown = messages.slice(-MAX_LINES);
    this.#forgetTexts(shown);
    this.#forgetSelection(messages);
    const lines = await Promise.all(shown.map(message => this.#line(message)));
    const isAll = this.#scope === SCOPES.ALL;
    if (isAll) markSceneChanges(lines);
    const title = isAll ? localize("TBG.History.allScenes") : canvas.scene?.name ?? localize("TBG.History.noScene");
    const count = this.#selected.size;
    const selection = { count, label: localize("TBG.History.selected", { count }) };
    const isSelecting = game.user.isGM && this.#isSelecting;
    const older = messages.length - shown.length;
    return { ...context, title, lines, isGM: game.user.isGM, isAll, isSelecting, selection, older };
  }

  async _preRender(context, options) {
    await super._preRender(context, options);
    const log = this.element?.querySelector(".tbg-history__log");
    this.#stickToBottom = !log || log.scrollHeight - log.scrollTop - log.clientHeight < BOTTOM_SLACK;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const log = this.element.querySelector(".tbg-history__log");
    if (this.#stickToBottom) log.scrollTop = log.scrollHeight;
  }

  async #line(message) {
    const kind = resolveKind(message);
    const isMaster = isMasterVoice(message);
    const token = speakerToken(message);
    return {
      id: message.id,
      kind,
      time: lineTime(message.timestamp),
      sceneName: sceneName(message),
      name: isMaster ? localize("TBG.History.master") : message.alias,
      ...lineArt(message, kind, isMaster),
      note: lineNote(message, kind),
      text: await this.#text(message),
      tokenId: token?.visible ? token.id : null,
      isSelected: this.#selected.has(message.id)
    };
  }

  /** O texto enriquecido fica guardado até a mensagem mudar: redesenhar a janela não enriquece tudo de novo. */
  async #text(message) {
    const cached = this.#texts.get(message.id);
    if (cached?.source === message.content) return cached.html;
    const secrets = message.speakerActor?.isOwner ?? game.user.isGM;
    const html = await foundry.applications.ux.TextEditor.implementation.enrichHTML(message.content, {
      rollData: message.getRollData(),
      secrets
    });
    this.#texts.set(message.id, { source: message.content, html });
    return html;
  }

  #forgetTexts(messages) {
    const ids = new Set(messages.map(message => message.id));
    for (const id of this.#texts.keys()) if (!ids.has(id)) this.#texts.delete(id);
  }

  /** A seleção só guarda falas que ainda existem no recorte aberto. */
  #forgetSelection(messages) {
    const ids = new Set(messages.map(message => message.id));
    for (const id of this.#selected) if (!ids.has(id)) this.#selected.delete(id);
  }

  #replaceSelection(messages) {
    this.#selected = new Set(messages.map(message => message.id));
    this.#lastPicked = null;
    this.render();
  }

  /** Marca tudo entre a última fala clicada e esta, na ordem em que aparecem na janela. */
  #pickRange(id) {
    const ids = [...this.element.querySelectorAll(".tbg-history__line")].map(line => line.dataset.messageId);
    const [from, to] = [ids.indexOf(this.#lastPicked), ids.indexOf(id)].sort((a, b) => a - b);
    if (from < 0) return void this.#selected.add(id);
    for (const rangeId of ids.slice(from, to + 1)) this.#selected.add(rangeId);
  }

  /** Clicar numa fala leva o mapa até o token que falou. */
  static #onPan(_event, target) {
    const token = canvas.tokens?.get(target.dataset.tokenId);
    if (token?.visible) canvas.animatePan({ x: token.center.x, y: token.center.y });
  }

  static #onScope(_event, target) {
    if (!game.user.isGM || target.dataset.scope === this.#scope) return;
    this.#scope = target.dataset.scope;
    this.#selected.clear();
    this.#stickToBottom = true;
    this.render();
  }

  /** Liga e desliga o modo de seleção do Mestre; sair dele esquece o que estava marcado. */
  static #onSelect() {
    if (!game.user.isGM) return;
    this.#isSelecting = !this.#isSelecting;
    this.#selected.clear();
    this.#lastPicked = null;
    this.render();
  }

  /** Marca ou desmarca a fala; com Shift, marca tudo desde a última fala clicada. */
  static #onPick(event, target) {
    const id = target.dataset.messageId;
    if (event.shiftKey && this.#lastPicked) this.#pickRange(id);
    else if (this.#selected.has(id)) this.#selected.delete(id);
    else this.#selected.add(id);
    this.#lastPicked = id;
    this.render();
  }

  /** Todas as falas do recorte, inclusive as antigas que a janela não mostra. */
  static #onPickAll() {
    this.#replaceSelection(historyMessages(this.#scope));
  }

  static #onPickDay() {
    const since = Date.now() - DAY_MS;
    this.#replaceSelection(historyMessages(this.#scope).filter(message => message.timestamp >= since));
  }

  static #onPickNone() {
    this.#replaceSelection([]);
  }

  /** Apaga de vez as falas marcadas, depois de confirmar; os outros clientes as perdem pelo próprio Foundry. */
  static async #onErase() {
    const ids = [...this.#selected].filter(id => game.messages.has(id));
    if (!game.user.isGM || !ids.length) return;
    const isConfirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("TBG.History.eraseTitle") },
      content: `<p>${localize("TBG.History.eraseContent", { count: ids.length })}</p>`,
      rejectClose: false
    });
    if (!isConfirmed) return;
    await ChatMessage.implementation.deleteDocuments(ids);
    this.#selected.clear();
    this.render();
  }

  /** Baixa em JSON toda a conversa do recorte aberto, sem o teto de linhas da janela, para ler fora do Foundry. */
  static #onExport() {
    if (!game.user.isGM) return;
    const isAll = this.#scope === SCOPES.ALL;
    const data = {
      world: game.world.title,
      scene: isAll ? null : canvas.scene?.name ?? null,
      exportedAt: new Date().toISOString(),
      lines: historyMessages(this.#scope).map(exportLine)
    };
    const name = isAll ? localize("TBG.History.allScenes") : canvas.scene?.name ?? localize("TBG.History.noScene");
    const date = new Date().toISOString().slice(0, 10);
    foundry.utils.saveDataToFile(JSON.stringify(data, null, 2), "application/json", `historico-${name.slugify()}-${date}.json`);
  }
}

/** O jogador vê a conversa da cena desde que o Mestre a ativou; o Mestre, a da cena inteira ou a de todas. */
function historyMessages(scope) {
  const talk = game.messages.contents.filter(message => isTalk(message) && message.isContentVisible);
  if (game.user.isGM && scope === SCOPES.ALL) return talk;
  const since = game.user.isGM ? 0 : talkSince(canvas.scene);
  return talk.filter(message => isCurrentScene(message) && message.timestamp >= since);
}

/** A hora da fala; a de outro dia leva a data, para separar de olho as das últimas 24 horas. */
function lineTime(timestamp) {
  const date = new Date(timestamp);
  const time = { hour: "2-digit", minute: "2-digit" };
  if (date.toDateString() === new Date().toDateString()) return date.toLocaleTimeString(game.i18n.lang, time);
  return date.toLocaleString(game.i18n.lang, { day: "2-digit", month: "2-digit", ...time });
}

function sceneName(message) {
  return game.scenes.get(talkScene(message))?.name ?? localize("TBG.History.noScene");
}

/** Em todas as cenas, uma faixa com o nome da cena abre cada trecho da conversa. */
function markSceneChanges(lines) {
  lines.forEach((line, index) => {
    line.opensScene = index === 0 || lines[index - 1].sceneName !== line.sceneName;
  });
}

function lineArt(message, kind, isMaster) {
  if (isMaster) return { icon: MASTER_ICON, portrait: null };
  if (kind === KINDS.NARRATION) return { icon: NARRATOR_ICON, portrait: null };
  return { icon: null, portrait: speakerImage(message) };
}

function lineNote(message, kind) {
  if (kind === KINDS.THINK) return localize("TBG.History.think");
  if (kind === KINDS.OOC) return localize("TBG.History.ooc");
  if (!message.whisper.length) return null;
  return localize("TBG.History.whisper", { names: whisperNames(message).join(", ") });
}

function whisperNames(message) {
  return message.whisper.map(id => game.users.get(id)?.name).filter(Boolean);
}

function exportLine(message) {
  const whisper = whisperNames(message);
  return {
    time: new Date(message.timestamp).toISOString(),
    scene: game.scenes.get(talkScene(message))?.name ?? null,
    kind: resolveKind(message),
    speaker: isMasterVoice(message) ? localize("TBG.History.master") : message.alias,
    author: message.author?.name ?? null,
    ...(whisper.length ? { whisper } : {}),
    text: exportText(message.content)
  };
}

/** O texto puro da fala; as ações voltam a ficar entre asteriscos, como foram escritas. */
function exportText(content) {
  const markup = parseMarkup(content);
  for (const action of markup.querySelectorAll("strong")) action.replaceWith(`*${action.textContent}*`);
  return markup.textContent.trim();
}

/** Logo abaixo do Mercado quando o sistema tem um; senão, no fim dos botões dos tokens. */
function toolOrder(tools) {
  const anchor = tools[ANCHOR_TOOL];
  return anchor ? anchor.order + 0.5 : Object.keys(tools).length;
}

function addTool(controls) {
  const tools = controls.tokens?.tools;
  if (!tools) return;
  tools[TOOL_NAME] = {
    name: TOOL_NAME,
    title: "TBG.History.button",
    icon: ICON,
    order: toolOrder(tools),
    button: true,
    visible: true,
    onChange: () => SceneHistory.toggle()
  };
}

function refreshOpenWindow() {
  foundry.applications.instances.get(WINDOW_ID)?.refresh();
}

/** Registra o botão do histórico e o que o mantém em dia. Chamar uma vez no `init`. */
export function registerHistory() {
  Hooks.on("getSceneControlButtons", addTool);
  for (const hook of ["createChatMessage", "updateChatMessage", "deleteChatMessage"]) {
    Hooks.on(hook, message => isTalk(message) && refreshOpenWindow());
  }
  Hooks.on("canvasReady", refreshOpenWindow);
  Hooks.on("updateScene", (scene, changed) => {
    if (scene === canvas.scene && foundry.utils.hasProperty(changed, `flags.${MODULE_ID}.talkSince`)) refreshOpenWindow();
  });
}
