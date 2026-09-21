import { INPUT_BLURRED, INPUT_CHANGED, SOCKET_TYPES } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { emit, onSocket } from "../sockets.mjs";
import { localize } from "../utils.mjs";
import { bubbleLayer } from "../bubbles/layer.mjs";
import { isNarratorActive } from "./narrator.mjs";

const EMIT_INTERVAL_MS = 1000;
const IDLE_MS = 3000;
const EXPIRY_MS = 4000;

/** Anuncia quem está digitando e mostra o selo no token, só enquanto há digitação, inclusive para a própria pessoa. */
class TypingAnnouncer {
  #announced = null;
  #lastEmit = 0;
  #idle = null;
  #expiries = new Map();

  activate() {
    Hooks.on(INPUT_CHANGED, length => this.#onInputChanged(length));
    Hooks.on(INPUT_BLURRED, () => this.#stop());
    Hooks.on("canvasTearDown", () => this.#clearExpiries());
    onSocket(SOCKET_TYPES.TYPING, ({ sceneId, tokenId }) => this.#show(sceneId, tokenId));
    onSocket(SOCKET_TYPES.TYPING_END, ({ tokenId }) => this.#hide(tokenId));
  }

  /** Texto parado no campo não é digitação: sem mudança por `IDLE_MS`, o anúncio acaba. */
  #onInputChanged(length) {
    if (!length || !getSetting(SETTINGS.TYPING_INDICATOR)) return this.#stop();
    this.#announce(currentSpeaker());
    clearTimeout(this.#idle);
    this.#idle = setTimeout(() => this.#stop(), IDLE_MS);
  }

  /** Quem emite não recebe o próprio pacote, então o selo local é ligado aqui. */
  #announce(speaker) {
    if (speaker?.tokenId !== this.#announced?.tokenId) this.#stop();
    const now = performance.now();
    if (!speaker || (this.#announced && now - this.#lastEmit < EMIT_INTERVAL_MS)) return;
    this.#announced = speaker;
    this.#lastEmit = now;
    emit(SOCKET_TYPES.TYPING, speaker);
    this.#show(speaker.sceneId, speaker.tokenId);
  }

  #stop() {
    clearTimeout(this.#idle);
    const speaker = this.#announced;
    if (!speaker) return;
    this.#announced = null;
    emit(SOCKET_TYPES.TYPING_END, speaker);
    this.#hide(speaker.tokenId);
  }

  #show(sceneId, tokenId) {
    if (!getSetting(SETTINGS.TYPING_INDICATOR) || !canvas.ready || sceneId !== canvas.scene.id) return;
    bubbleLayer.setTyping(tokenId, true, localize("TBG.Typing.label"));
    clearTimeout(this.#expiries.get(tokenId));
    this.#expiries.set(tokenId, setTimeout(() => this.#hide(tokenId), EXPIRY_MS));
  }

  #hide(tokenId) {
    clearTimeout(this.#expiries.get(tokenId));
    this.#expiries.delete(tokenId);
    bubbleLayer.setTyping(tokenId, false);
  }

  #clearExpiries() {
    for (const timer of this.#expiries.values()) clearTimeout(timer);
    this.#expiries.clear();
  }
}

/** Narrando, o Mestre não fala pelo token selecionado, então não há selo. */
function currentSpeaker() {
  if (isNarratorActive()) return null;
  const { scene, token } = ChatMessage.implementation.getSpeaker();
  return token ? { sceneId: scene, tokenId: token } : null;
}

/** Liga o indicador de digitação sobre o token. */
export function registerTypingIndicator() {
  new TypingAnnouncer().activate();
}
