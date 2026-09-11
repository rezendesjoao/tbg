import { KINDS, MODULE_ID } from "../constants.mjs";
import { SETTINGS, getSetting, setSetting } from "../settings.mjs";
import { localize, stripParagraph } from "../utils.mjs";

const BUTTON_SELECTOR = "[data-tbg-narrator]";

/** Registra o interruptor do Modo Narrador: hook de chat, botão junto aos modos de mensagem e atalho. */
export function registerNarrator() {
  Hooks.on("chatMessage", narrateFromInput);
  Hooks.on("renderChatInput", addNarratorButton);
  game.keybindings.register(MODULE_ID, "toggleNarrator", {
    name: "TBG.Narrator.toggle",
    hint: "TBG.Narrator.toggleHint",
    editable: [{ key: "KeyN", modifiers: ["Alt"] }],
    restricted: true,
    onDown: () => {
      toggleNarrator();
      return true;
    }
  });
}

export function isNarratorActive() {
  return game.user.isGM && getSetting(SETTINGS.NARRATOR_ACTIVE);
}

/** Nome configurado do narrador, ou o padrão traduzido. */
export function narratorName() {
  return getSetting(SETTINGS.NARRATOR_NAME) || localize("TBG.Narrator.name");
}

/** Dados que transformam uma mensagem em narração. */
export function narrationData(content) {
  return {
    content,
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    speaker: { alias: narratorName(), scene: game.user.viewedScene, actor: null, token: null },
    whisper: [],
    blind: false,
    flags: { [MODULE_ID]: { kind: KINDS.NARRATION } }
  };
}

/** Cria uma narração pontual; só o Mestre pode narrar. */
export function narrate(content) {
  if (!game.user.isGM) throw new Error(localize("TBG.Errors.narratorGMOnly"));
  return ChatMessage.implementation.create(narrationData(content));
}

/** Liga ou desliga o Modo Narrador deste cliente. */
export async function toggleNarrator() {
  if (!game.user.isGM) return;
  const active = !getSetting(SETTINGS.NARRATOR_ACTIVE);
  await setSetting(SETTINGS.NARRATOR_ACTIVE, active);
  syncNarratorButton();
  ui.notifications.info(localize(active ? "TBG.Narrator.on" : "TBG.Narrator.off"));
}

function narrateFromInput(chatLog, message, chatData) {
  if (!isNarratorActive()) return;
  const [command] = chatLog.constructor.parse(message);
  if (command !== "none") return;
  ChatMessage.implementation.create({ ...chatData, ...narrationData(stripParagraph(message)) });
  return false;
}

function addNarratorButton(_chatLog, elements) {
  const modes = elements["#message-modes"];
  if (!game.user.isGM || !modes || modes.querySelector(BUTTON_SELECTOR)) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ui-control icon fa-solid fa-scroll";
  button.dataset.tbgNarrator = "";
  button.dataset.tooltip = "";
  button.ariaLabel = localize("TBG.Narrator.button");
  button.addEventListener("click", toggleNarrator);
  modes.append(button);
  syncNarratorButton();
}

function syncNarratorButton() {
  const button = document.querySelector(`#message-modes ${BUTTON_SELECTOR}`);
  if (button) button.ariaPressed = String(isNarratorActive());
}
