import { KINDS, TEMPLATES } from "../constants.mjs";
import { localize } from "../utils.mjs";
import { isMasterVoice, isTalk, resolveKind } from "../chat/kinds.mjs";
import { speakerImage, speakerToken } from "../chat/speaker.mjs";
import { isCurrentScene } from "./scene.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const WINDOW_ID = "tbg-history";
const TOOL_NAME = "tbgHistory";
const ICON = "fa-solid fa-comments";
const MASTER_ICON = "fa-solid fa-crown";
const NARRATOR_ICON = "fa-solid fa-scroll";
const MAX_LINES = 200;
const BOTTOM_SLACK = 24;
const REFRESH_MS = 80;

/** Botão do Mercado da Eternia: o do histórico entra logo abaixo dele. */
const ANCHOR_TOOL = "eterniaMarket";

/**
 * O histórico da cena: a conversa da cena que se está vendo, da mais antiga à mais nova, para quem se distraiu ou
 * chegou depois. Acompanha as mensagens ao vivo e desce sozinho quando já estava no fim.
 */
class SceneHistory extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: WINDOW_ID,
    classes: ["tbg-history"],
    window: { title: "TBG.History.title", icon: ICON, resizable: true },
    position: { width: 380, height: 460, left: 120, top: 110 },
    actions: { pan: SceneHistory.#onPan }
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

  refresh = foundry.utils.debounce(() => this.render(), REFRESH_MS);

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const messages = game.messages.contents.filter(isSceneLine).slice(-MAX_LINES);
    this.#forgetTexts(messages);
    const lines = await Promise.all(messages.map(message => this.#line(message)));
    return { ...context, scene: canvas.scene?.name ?? localize("TBG.History.noScene"), lines };
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
}

function isSceneLine(message) {
  return isTalk(message) && message.isContentVisible && isCurrentScene(message);
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
  const names = message.whisper.map(id => game.users.get(id)?.name).filter(Boolean).join(", ");
  return localize("TBG.History.whisper", { names });
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
}
