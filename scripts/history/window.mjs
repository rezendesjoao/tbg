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
    actions: { pan: SceneHistory.#onPan, scope: SceneHistory.#onScope, export: SceneHistory.#onExport }
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

  refresh = foundry.utils.debounce(() => this.render(), REFRESH_MS);

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const messages = historyMessages(this.#scope);
    const shown = messages.slice(-MAX_LINES);
    this.#forgetTexts(shown);
    const lines = await Promise.all(shown.map(message => this.#line(message)));
    const isAll = this.#scope === SCOPES.ALL;
    if (isAll) markSceneChanges(lines);
    const title = isAll ? localize("TBG.History.allScenes") : canvas.scene?.name ?? localize("TBG.History.noScene");
    return { ...context, title, lines, isGM: game.user.isGM, isAll, older: messages.length - shown.length };
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
      time: new Date(message.timestamp).toLocaleTimeString(game.i18n.lang, { hour: "2-digit", minute: "2-digit" }),
      sceneName: sceneName(message),
      name: isMaster ? localize("TBG.History.master") : message.alias,
      ...lineArt(message, kind, isMaster),
      note: lineNote(message, kind),
      text: await this.#text(message),
      tokenId: token?.visible ? token.id : null
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

  /** Clicar numa fala leva o mapa até o token que falou. */
  static #onPan(_event, target) {
    const token = canvas.tokens?.get(target.dataset.tokenId);
    if (token?.visible) canvas.animatePan({ x: token.center.x, y: token.center.y });
  }

  static #onScope(_event, target) {
    if (!game.user.isGM || target.dataset.scope === this.#scope) return;
    this.#scope = target.dataset.scope;
    this.#stickToBottom = true;
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
