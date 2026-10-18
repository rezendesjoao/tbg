import { KINDS, MODULE_ID } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { localize } from "../utils.mjs";
import { isSpeech } from "./kinds.mjs";

const CUSTOM_CHAT_TABS_ID = "custom-chat-tabs";
const CARD_MARKUP = /<(div|section|header|footer|table|form|button|figure)\b/i;

/** Abas do TBG no Custom Chat Tabs. Juntas cobrem toda mensagem, então nada some com a aba All escondida. */
const TABS = [
  { key: "tbg-on", name: "on", filter: isInCharacter },
  { key: "tbg-off", name: "off", filter: isOutOfCharacter },
  { key: "tbg-roll", name: "roll", filter: isMechanics }
];

/** Registra as abas ON, OFF e ROLL pela API do Custom Chat Tabs e abre o chat no ON. */
export function registerChatTabs() {
  Hooks.on(`${CUSTOM_CHAT_TABS_ID}.init`, addTabs);
  Hooks.on("renderChatMessageHTML", showNotification);
  Hooks.once("ready", offerToEnableTabs);
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

/** A notificação do canto da tela mostra toda mensagem nova: a aba ativa filtra só o log. */
function showNotification(message, html, context) {
  // O Custom Chat Tabs esconde também a notificação, e o core só a renderiza com `canClose`.
  if (!context?.canClose || !hasTabs()) return;
  html.style.removeProperty("display");
}

/** Com as abas desligadas no Custom Chat Tabs, oferece ao Mestre ligá-las, que é o que faz ON, OFF e ROLL existirem. */
async function offerToEnableTabs() {
  const tabs = game.modules.get(CUSTOM_CHAT_TABS_ID);
  if (!game.user.isGM || !tabs?.active || !getSetting(SETTINGS.CHAT_TABS)) return;
  if (game.settings.get(CUSTOM_CHAT_TABS_ID, "enable")) return;
  const accepted = await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("TBG.Tabs.enable.title") },
    content: `<p>${localize("TBG.Tabs.enable.content")}</p>`,
    rejectClose: false
  });
  if (!accepted) return;
  await game.settings.set(CUSTOM_CHAT_TABS_ID, "enable", true);
  foundry.utils.debouncedReload();
}

function hasTabs() {
  return getSetting(SETTINGS.CHAT_TABS) && !!game.modules.get(CUSTOM_CHAT_TABS_ID)?.active
    && !!game.settings.get(CUSTOM_CHAT_TABS_ID, "enable");
}

/** Fala, ação, pensamento, sussurro em personagem e narração; o `/off` do TBG também é fala, mas fica no OFF. */
function isInCharacter(message) {
  return isSpeech(message) && message.getFlag(MODULE_ID, "kind") !== KINDS.OOC;
}

/**
 * Sussurro digitado sem personagem chega sem falante: é conversa fora do personagem. Cartão de sistema sussurrado
 * ao Mestre também chega sem falante, mas traz marcação de cartão e fica no ROLL.
 */
function isOutOfCharacter(message) {
  if (message.isRoll || isInCharacter(message)) return false;
  if (message.getFlag(MODULE_ID, "kind") === KINDS.OOC || message.style === CONST.CHAT_MESSAGE_STYLES.OOC) return true;
  const { actor, token } = message.speaker;
  return message.whisper.length > 0 && !actor && !token && !CARD_MARKUP.test(message.content ?? "");
}

function isMechanics(message) {
  return !isInCharacter(message) && !isOutOfCharacter(message);
}
