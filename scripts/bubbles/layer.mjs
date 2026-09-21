import { BUBBLE_KINDS, KINDS, USAGE_KIND } from "../constants.mjs";
import { BUBBLE_LAYOUTS, BUBBLE_SCALINGS, SETTINGS, getSetting } from "../settings.mjs";
import { localize } from "../utils.mjs";
import { isSpeech, resolveKind } from "../chat/kinds.mjs";
import { actorToken, speakerToken } from "../chat/speaker.mjs";
import { isRepeatedUsage, resolveUsage } from "../chat/usage.mjs";
import Bubble from "./bubble.mjs";
import TypingIndicator from "./typing-indicator.mjs";

const CONTAINER_ID = "tbg-bubbles";
const GAP = 6;
const PUSH_TAU_MS = 55;
const MAX_FRAME_MS = 100;
const MAX_PUSH_ROUNDS = 500;
const STALE_CLOCK_MS = 150;
const ROLL_ICON = "fa-solid fa-dice-d20";

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
  async say({ id = foundry.utils.randomID(), token, kind = KINDS.SAY, content, name = token.name, icon, iconClass }) {
    const container = this.element;
    if (!container) return null;
    this.remove(id);
    container.style.setProperty("--tbg-bubble-max-width", `${getSetting(SETTINGS.BUBBLE_MAX_WIDTH)}px`);
    const portrait = getSetting(SETTINGS.BUBBLE_PORTRAIT) ? token.document.texture.src : null;
    const bubble = await Bubble.create({ id, token, kind, content, name, portrait, icon, iconClass });
    container.append(bubble.element);
    bubble.measure();
    this.#push(bubble);
    this.#bubbles.set(id, bubble);
    this.#layoutAll();
    bubble.show();
    this.#start();
    return bubble;
  }

  /** Liga ou desliga o selo de digitação no canto do token. */
  setTyping(tokenId, active, label) {
    const existing = this.#typing.get(tokenId);
    if (!active) {
      existing?.element.remove();
      this.#typing.delete(tokenId);
      return;
    }
    const container = this.element;
    const token = canvas.tokens?.get(tokenId);
    if (existing || !container || !token || !this.isActive) return;
    const indicator = TypingIndicator.create({ token, label });
    container.append(indicator.element);
    this.#typing.set(tokenId, indicator);
    indicator.layout();
    indicator.show();
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

  /** `visible` é verdadeiro para todos num sussurro com rolagem; `isContentVisible` é o que não vaza. */
  async onMessage(message) {
    if (!this.isActive || !message.isContentVisible) return;
    const usage = getSetting(SETTINGS.USAGE_BUBBLES) ? resolveUsage(message) : null;
    if (usage) return this.#announceUsage(message, usage);
    if (!isSpeech(message)) return;
    const kind = resolveKind(message);
    const token = speakerToken(message);
    if (!BUBBLE_KINDS.has(kind) || !token) return;
    this.setTyping(token.id, false);
    await this.say({ id: message.id, token, kind, content: await enrich(message), name: message.alias });
  }

  /**
   * Token que este cliente não vê não ganha balão: escondido, ainda empurraria os balões vizinhos e
   * denunciaria onde está. Sistemas que gravam só o ator caem no único token dele na cena.
   */
  #announceUsage(message, usage) {
    const token = message.speaker.token ? speakerToken(message) : actorToken(usage.actor);
    if (!token?.visible || isRepeatedUsage(message, usage)) return;
    const name = usageName(message, usage.actor, token);
    const key = usage.isRoll ? "TBG.Usage.rolled" : "TBG.Usage.used";
    const content = localize(key, { name: strong(name), label: strong(usage.label) });
    const iconClass = usage.img ? null : ROLL_ICON;
    return this.say({ id: message.id, token, kind: USAGE_KIND, content, name, icon: usage.img, iconClass });
  }

  /** O balão de uso é um resumo; um update do cartão não pode trocá-lo pelo HTML inteiro. */
  async onMessageUpdated(message, changed) {
    const bubble = this.#bubbles.get(message.id);
    if (!bubble || bubble.kind === USAGE_KIND || !("content" in changed)) return;
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

  #layoutAll() {
    const scale = this.#scale();
    for (const bubble of this.#bubbles.values()) this.#layoutBubble(bubble, scale);
    for (const indicator of this.#typing.values()) indicator.layout();
  }

  #layoutToken(tokenId) {
    const scale = this.#scale();
    for (const bubble of this.#bubbles.values()) {
      if (bubble.tokenId === tokenId) this.#layoutBubble(bubble, scale);
    }
    this.#typing.get(tokenId)?.layout();
  }

  #layoutBubble(bubble, scale) {
    if (this.#clockStale()) bubble.settlePush();
    bubble.layout(scale);
  }

  /** Sem quadros recentes não há quem suavize o empurrão, e sem concluí-lo os balões nasceriam sobrepostos. */
  #clockStale() {
    return this.#frame === null || performance.now() - this.#lastTick > STALE_CLOCK_MS;
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
    for (const indicator of this.#typing.values()) indicator.layout();
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

/**
 * O alias vale quando alguém o escolheu, como o nome de um combatente renomeado. Quando é só o nome do ator,
 * que o sistema grava por padrão, vale o nome do token, para não revelar quem está por trás de um NPC disfarçado.
 */
function usageName(message, actor, token) {
  const { alias } = message.speaker;
  return alias && alias !== actor.name ? alias : token.document.name;
}

function strong(text) {
  return `<strong>${foundry.utils.escapeHTML(text)}</strong>`;
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
