import { INPUT_CHANGED, SOCKET_TYPES } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { emit, onSocket } from "../sockets.mjs";
import { localize } from "../utils.mjs";
import { bubbleLayer } from "../bubbles/layer.mjs";

const EMIT_INTERVAL_MS = 1000;
const EXPIRY_MS = 5000;

const expiries = new Map();
let lastEmit = 0;
let announcing = false;

/** Mostra um balão de reticências sobre o token de quem está digitando. */
export function registerTypingIndicator() {
  Hooks.on(INPUT_CHANGED, onInputChanged);
  Hooks.on("canvasTearDown", clearAll);
  onSocket(SOCKET_TYPES.TYPING, ({ sceneId, tokenId }) => show(sceneId, tokenId));
  onSocket(SOCKET_TYPES.TYPING_END, ({ tokenId }) => hide(tokenId));
}

function onInputChanged(length) {
  if (!getSetting(SETTINGS.TYPING_INDICATOR)) return;
  if (length > 0) startAnnouncing();
  else stopAnnouncing();
}

function startAnnouncing() {
  const now = performance.now();
  if (announcing && now - lastEmit < EMIT_INTERVAL_MS) return;
  const speaker = currentSpeaker();
  if (!speaker) return;
  announcing = true;
  lastEmit = now;
  emit(SOCKET_TYPES.TYPING, speaker);
}

function stopAnnouncing() {
  if (!announcing) return;
  announcing = false;
  const speaker = currentSpeaker();
  if (speaker) emit(SOCKET_TYPES.TYPING_END, speaker);
}

function currentSpeaker() {
  const { scene, token } = ChatMessage.implementation.getSpeaker();
  return token ? { sceneId: scene, tokenId: token } : null;
}

function show(sceneId, tokenId) {
  if (!getSetting(SETTINGS.TYPING_INDICATOR) || !canvas.ready || sceneId !== canvas.scene.id) return;
  bubbleLayer.setTyping(tokenId, true, localize("TBG.Typing.label"));
  clearTimeout(expiries.get(tokenId));
  expiries.set(tokenId, setTimeout(() => hide(tokenId), EXPIRY_MS));
}

function hide(tokenId) {
  clearTimeout(expiries.get(tokenId));
  expiries.delete(tokenId);
  bubbleLayer.setTyping(tokenId, false);
}

function clearAll() {
  for (const timer of expiries.values()) clearTimeout(timer);
  expiries.clear();
}
