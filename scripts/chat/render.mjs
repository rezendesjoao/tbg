import { SETTINGS, getSetting } from "../settings.mjs";
import { isTalk, resolveKind } from "./kinds.mjs";
import { speakerImage } from "./speaker.mjs";

/** Aplica o tema TBG a cada cartão de rolagem renderizado; a conversa nem aparece no chat lateral. */
export function registerChatRender() {
  Hooks.on("renderChatMessageHTML", decorateMessage);
}

function decorateMessage(message, html) {
  if (!getSetting(SETTINGS.CHAT_THEME) || isTalk(message)) return;
  const kind = resolveKind(message);
  html.classList.add("tbg-message");
  if (kind) html.classList.add(`tbg-kind-${kind}`);
  if (message.isRoll) html.classList.add("tbg-roll");
  const color = message.author?.color?.css;
  if (color) html.style.setProperty("--tbg-author-color", color);
  addPortrait(html, message);
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
