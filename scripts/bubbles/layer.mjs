import { BUBBLE_KINDS, KINDS } from "../constants.mjs";
import { BUBBLE_LAYOUTS, BUBBLE_SCALINGS, SETTINGS, getSetting } from "../settings.mjs";
import { resolveKind } from "../chat/kinds.mjs";
import { speakerToken } from "../chat/speaker.mjs";
import Bubble from "./bubble.mjs";

const CONTAINER_ID = "tbg-bubbles";
const GAP = 6;
const PUSH_TAU_MS = 55;
const MAX_FRAME_MS = 100;
const MAX_PUSH_ROUNDS = 500;

/** Camada HTML no HUD do canvas que cria, empilha, sobe e remove balões. */
class BubbleLayer {
  #bubbles = new Map();
  #typing = new Map();
  #frame = null;
  #lastTick = 0;

  /** Liga os hooks que alimentam a camada. Chamar uma vez no `init`. */
  activate() {
    Hooks.on("renderHeadsUpDisplayContainer", () => this.mount());
    Hooks.on("canvasTearDown", () => this.clear());
    Hooks.on("preCreateChatMessage", (_message, _data, options) => this.silenceCoreBubble(options));
    Hooks.on("createChatMessage", message => this.onMessage(message));
    Hooks.on("updateChatMessage", (message, changed) => this.onMessageUpdated(message, changed));
    Hooks.on("deleteChatMessage", message => this.remove(message.id));
    Hooks.on("deleteToken", token => this.removeToken(token.id));
    Hooks.on("refreshToken", token => this.#layoutToken(token.id));
    Hooks.on("updateToken", token => this.#layoutToken(token.id));
    Hooks.on("chatBubbleHTML", (token, _html, content, options) => this.onCoreBubble(token, content, options));
    Hooks.on("tbg.enabledChanged", enabled => enabled || this.clear());
  }

  get isActive() {
    return getSetting(SETTINGS.ENABLED) && game.settings.get("core", "chatBubbles");
  }

  get element() {
    return document.getElementById(CONTAINER_ID);
  }

  /** Cria o container dentro de `#hud`, cujo conteúdo o core substitui a cada renderização. */
  mount() {
    this.clear();
    const hud = canvas.hud?.element;
    if (!hud || this.element) return;
    const container = document.createElement("div");
    container.id = CONTAINER_ID;
    hud.append(container);
  }

  clear() {
    this.#bubbles.clear();
    this.#typing.clear();
    this.element?.replaceChildren();
    this.#stop();
  }

  /** Mostra um balão para `token`; `content` é HTML já enriquecido. */
  async say({ id = foundry.utils.randomID(), token, kind = KINDS.SAY, content, name = token.name }) {
    const container = this.element;
    if (!container) return null;
    this.remove(id);
    container.style.setProperty("--tbg-bubble-max-width", `${getSetting(SETTINGS.BUBBLE_MAX_WIDTH)}px`);
    const portrait = getSetting(SETTINGS.BUBBLE_PORTRAIT) ? token.document.texture.src : null;
    const bubble = await Bubble.create({ id, token, kind, content, name, portrait });
    container.append(bubble.element);
    bubble.measure();
    this.#push(bubble);
    this.#bubbles.set(id, bubble);
    this.#layoutAll();
    bubble.show();
    this.#start();
    return bubble;
  }

  /** Liga ou desliga o indicador de digitação sobre um token. */
  async setTyping(tokenId, active, label) {
    const existing = this.#typing.get(tokenId);
    if (!active) {
      existing?.element.remove();
      this.#typing.delete(tokenId);
      return;
    }
    const container = this.element;
    const token = canvas.tokens?.get(tokenId);
    if (existing || !container || !token || !this.isActive) return;
    const bubble = await Bubble.createTyping({ token, label });
    container.append(bubble.element);
    bubble.measure();
    this.#typing.set(tokenId, bubble);
    bubble.layout(this.#scale());
    bubble.show();
  }

  remove(id) {
    const bubble = this.#bubbles.get(id);
    if (!bubble) return;
    this.#bubbles.delete(id);
    bubble.element.remove();
  }

  removeToken(tokenId) {
    for (const bubble of this.#bubbles.values()) {
      if (bubble.tokenId === tokenId) this.remove(bubble.id);
    }
    this.setTyping(tokenId, false);
  }

  async onMessage(message) {
    if (!this.isActive || message.rolls.length || !message.visible) return;
    const kind = resolveKind(message);
    const token = speakerToken(message);
    if (!BUBBLE_KINDS.has(kind) || !token) return;
    this.setTyping(token.id, false);
    await this.say({ id: message.id, token, kind, content: await enrich(message), name: message.alias });
  }

  async onMessageUpdated(message, changed) {
    const bubble = this.#bubbles.get(message.id);
    if (!bubble || !("content" in changed)) return;
    bubble.setContent(await enrich(message));
    this.#layoutAll();
  }

  onCoreBubble(token, content, options) {
    if (!this.isActive) return;
    const kind = options.cssClasses?.includes("emote") ? KINDS.ACTION : KINDS.SAY;
    this.say({ token, kind, content });
    return false;
  }

  silenceCoreBubble(options) {
    if (this.isActive) options.chatBubble = false;
  }

  #push(bubble) {
    const scale = this.#scale();
    const others = [...this.#bubbles.values()];
    if (getSetting(SETTINGS.BUBBLE_LAYOUT) === BUBBLE_LAYOUTS.LINE) {
      for (const other of others) other.pushTarget += bubble.height + GAP;
      return;
    }
    const queue = [bubble];
    let rounds = 0;
    while (queue.length && rounds++ < MAX_PUSH_ROUNDS) {
      const mover = queue.pop();
      const rect = mover.rect(scale);
      for (const other of others) {
        if (other === mover) continue;
        const otherRect = other.rect(scale);
        if (!overlaps(rect, otherRect)) continue;
        other.pushTarget += (otherRect.bottom - rect.top) / scale + GAP;
        queue.push(other);
      }
    }
  }

  #scale() {
    return getSetting(SETTINGS.BUBBLE_SCALING) === BUBBLE_SCALINGS.SCREEN ? 1 / canvas.stage.scale.x : 1;
  }

  #all() {
    return [...this.#bubbles.values(), ...this.#typing.values()];
  }

  #layoutAll() {
    const scale = this.#scale();
    for (const bubble of this.#all()) this.#layoutOne(bubble, scale);
  }

  #layoutToken(tokenId) {
    const scale = this.#scale();
    for (const bubble of this.#all()) {
      if (bubble.tokenId === tokenId) this.#layoutOne(bubble, scale);
    }
  }

  #layoutOne(bubble, scale) {
    if (document.hidden) bubble.settlePush();
    bubble.layout(scale);
  }

  #start() {
    if (this.#frame !== null) return;
    this.#lastTick = performance.now();
    this.#frame = requestAnimationFrame(this.#tick);
  }

  #stop() {
    if (this.#frame !== null) cancelAnimationFrame(this.#frame);
    this.#frame = null;
  }

  #tick = now => {
    this.#frame = null;
    if (!canvas.ready) return this.clear();
    const elapsed = Math.min(now - this.#lastTick, MAX_FRAME_MS);
    this.#lastTick = now;
    const scale = this.#scale();
    const seconds = elapsed / 1000;
    const settling = 1 - Math.exp(-elapsed / PUSH_TAU_MS);
    const speed = getSetting(SETTINGS.BUBBLE_RISE_SPEED);
    const limit = getSetting(SETTINGS.BUBBLE_RISE_LIMIT);
    const lifetime = getSetting(SETTINGS.BUBBLE_MAX_LIFETIME) * 1000;
    for (const bubble of this.#bubbles.values()) {
      bubble.rise += speed * seconds;
      bubble.pushOffset += (bubble.pushTarget - bubble.pushOffset) * settling;
      const expired = bubble.token.destroyed
        || bubble.targetOffset + bubble.height > limit
        || (lifetime > 0 && now - bubble.createdAt > lifetime);
      if (expired) this.#expire(bubble);
      else bubble.layout(scale);
    }
    for (const bubble of this.#typing.values()) bubble.layout(scale);
    if (this.#bubbles.size) this.#frame = requestAnimationFrame(this.#tick);
  };

  #expire(bubble) {
    this.#bubbles.delete(bubble.id);
    if (bubble.token.destroyed) bubble.element.remove();
    else bubble.fadeOut();
  }
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function enrich(message) {
  const secrets = message.speakerActor?.isOwner ?? game.user.isGM;
  return foundry.applications.ux.TextEditor.implementation.enrichHTML(message.content, {
    rollData: message.getRollData(),
    secrets
  });
}

export const bubbleLayer = new BubbleLayer();

/** Ativa a camada de balões. */
export function registerBubbles() {
  bubbleLayer.activate();
}
