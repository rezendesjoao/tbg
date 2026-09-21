import { KINDS, MODULE_ID } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { localize } from "../utils.mjs";
import { isSpeech } from "./kinds.mjs";

const CUSTOM_CHAT_TABS_ID = "custom-chat-tabs";

/** Abas do TBG no Custom Chat Tabs. Juntas cobrem toda mensagem, então nada some com a aba All escondida. */
const TABS = [
  { key: "tbg-on", name: "on", filter: isInCharacter },
  { key: "tbg-off", name: "off", filter: isOutOfCharacter },
  { key: "tbg-roll", name: "roll", filter: isMechanics }
];

/** Registra as abas ON, OFF e ROLL pela API do Custom Chat Tabs e abre o chat no ON. */
export function registerChatTabs() {
  Hooks.on(`${CUSTOM_CHAT_TABS_ID}.init`, addTabs);
}

function addTabs() {
  const api = game.modules.get(CUSTOM_CHAT_TABS_ID)?.api;
  if (!api || !getSetting(SETTINGS.CHAT_TABS)) return;
  for (const { key, name, filter } of TABS) {
    const label = localize(`TBG.Tabs.${name}.label`);
    api.register({ key, label, hint: localize(`TBG.Tabs.${name}.hint`), filter, removable: false });
  }
  api.setActiveTab(TABS[0].key, ui.chat.element);
}

/** Fala, ação, pensamento, sussurro em personagem e narração; o `/off` do TBG também é fala, mas fica no OFF. */
function isInCharacter(message) {
  return isSpeech(message) && message.getFlag(MODULE_ID, "kind") !== KINDS.OOC;
}

/** Sussurro digitado sem personagem chega sem falante: é conversa fora do personagem, não cartão de sistema. */
function isOutOfCharacter(message) {
  if (message.isRoll || isInCharacter(message)) return false;
  if (message.getFlag(MODULE_ID, "kind") === KINDS.OOC || message.style === CONST.CHAT_MESSAGE_STYLES.OOC) return true;
  const { actor, token } = message.speaker;
  return message.whisper.length > 0 && !actor && !token;
}

function isMechanics(message) {
  return !isInCharacter(message) && !isOutOfCharacter(message);
}
