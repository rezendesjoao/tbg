import { KINDS } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { resolveKind } from "./kinds.mjs";
import { speakerImage } from "./speaker.mjs";

const GROUPING_WINDOW_MS = 5 * 60 * 1000;
const SPEAKER_KEYS = ["token", "actor", "alias"];

/** Aplica o tema TBG a cada cartão de mensagem renderizado. */
export function registerChatRender() {
  Hooks.on("renderChatMessageHTML", decorateMessage);
}

function decorateMessage(message, html) {
  if (!getSetting(SETTINGS.CHAT_THEME)) return;
  const kind = resolveKind(message);
  html.classList.add("tbg-message");
  if (kind) html.classList.add(`tbg-kind-${kind}`);
  if (message.isRoll) html.classList.add("tbg-roll");
  const color = message.author?.color?.css;
  if (color) html.style.setProperty("--tbg-author-color", color);
  if (kind !== KINDS.NARRATION) addPortrait(html, message);
  if (getSetting(SETTINGS.CHAT_GROUPING) && continuesPrevious(message, kind)) html.classList.add("tbg-continued");
}

/** Sistemas que desenham o próprio retrato só o inserem depois deste hook, então quem esconde o nosso é o CSS. */
function addPortrait(html, message) {
  const src = speakerImage(message);
  if (!src) return;
  const portrait = document.createElement("img");
  portrait.className = "tbg-portrait";
  portrait.src = src;
  portrait.alt = "";
  html.prepend(portrait);
  html.classList.add("tbg-has-portrait");
}

function continuesPrevious(message, kind) {
  const previous = previousVisible(message);
  if (!previous || previous.isRoll || message.isRoll) return false;
  const sameAuthor = previous.author?.id === message.author?.id;
  const sameSpeaker = SPEAKER_KEYS.every(key => previous.speaker[key] === message.speaker[key]);
  const sameKind = resolveKind(previous) === kind;
  const sameAudience = previous.whisper.join() === message.whisper.join();
  const recent = message.timestamp - previous.timestamp < GROUPING_WINDOW_MS;
  return sameAuthor && sameSpeaker && sameKind && sameAudience && recent;
}

function previousVisible(message) {
  const messages = game.messages.contents;
  for (let index = messages.indexOf(message) - 1; index >= 0; index--) {
    if (messages[index].visible) return messages[index];
  }
  return null;
}
