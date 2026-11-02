import { BUBBLE_KINDS, KINDS, USAGE_KIND } from "../constants.mjs";
import { BUBBLE_LAYOUTS, SETTINGS, getSetting } from "../settings.mjs";
import { localize } from "../utils.mjs";
import { isMasterVoice, isSpeech, isTalk, resolveKind } from "../chat/kinds.mjs";
import { actorToken, speakerImage, speakerToken } from "../chat/speaker.mjs";
import { isRepeatedUsage, resolveUsage } from "../chat/usage.mjs";
import { isCurrentScene } from "../history/scene.mjs";
import Bubble from "./bubble.mjs";
import TypingIndicator from "./typing-indicator.mjs";

const CONTAINER_ID = "tbg-bubbles";
const TYPING_CONTAINER_ID = "tbg-typing-indicators";
const GAP = 8;
const EDGE = 8;
const MAX_BASELINE_RATIO = 0.9;
const ROLL_ICON = "fa-solid fa-dice-d20";
const NARRATOR_ICON = "fa-solid fa-scroll";

/** O balão novo fica parado um instante antes do primeiro pulo, mesmo que nasça às vésperas de um (pedido do usuário). */
const DWELL_MS = 700;

/** O balão do narrador fica pelo menos meio minuto, para a mesa ler com calma (pedido do usuário). */
const NARRATION_MIN_MS = 30000;

/**
 * A faixa dos balões, presa ao topo da tela como nas salas de bate-papo dos jogos. Todo balão nasce na mesma linha, na
 * altura do *Limite de subida*, embaixo do token que fala (no meio, sem token), e empurra para cima os que encosta; de
 * tempos em tempos todos pulam uma linha, e quem passa do topo some. O pulo é uma transição curta de `transform` e o
 * pan do mapa só mexe no `translate`, então nada roda a cada quadro.
 */
class BubbleLayer {
  #bubbles = new Map();
  #typing = new Map();
  #timer = null;
  #hops = 0;
  #lastBirth = 0;
  #row = 0;
  #zoom = null;
  #metrics = null;

  /** Liga os hooks que alimentam a faixa. Chamar uma vez no `init`. */
  activate() {
    Hooks.once("ready", () => this.mount());
    Hooks.on("renderHeadsUpDisplayContainer", () => this.mountTyping());
    Hooks.on("canvasTearDown", () => this.clear());
    Hooks.on("canvasPan", () => this.#follow());
    Hooks.on("preCreateChatMessage", (_message, _data, options) => this.silenceCoreBubble(options));
    Hooks.on("createChatMessage", message => this.onMessage(message));
    Hooks.on("updateChatMessage", (message, changed) => this.onMessageUpdated(message, changed));
    Hooks.on("deleteChatMessage", message => this.remove(message.id));
    Hooks.on("deleteToken", token => this.setTyping(token.id, false));
    Hooks.on("refreshToken", token => this.#typing.get(token.id)?.layout());
    Hooks.on("updateToken", token => this.#typing.get(token.id)?.layout());
    Hooks.on("chatBubbleHTML", (token, _html, content, options) => this.onCoreBubble(token, content, options));
    Hooks.on("tbg.enabledChanged", enabled => enabled || this.clear());
  }

  get isActive() {
    return getSetting(SETTINGS.ENABLED) && game.settings.get("core", "chatBubbles");
  }

  get element() {
    return document.getElementById(CONTAINER_ID);
  }

  /** A faixa fica fora do canvas e da interface: logo acima do mapa, abaixo do HUD e das colunas do core. */
  mount() {
    if (this.element) return;
    const container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.classList.toggle("tbg-bubbles--still", game.settings.get("core", "photosensitiveMode"));
    document.body.append(container);
  }

  /** O selo de digitação fica no token, dentro de `#hud`, cujo conteúdo o core substitui a cada renderização. */
  mountTyping() {
    this.#typing.clear();
    const hud = canvas.hud?.element;
    if (!hud || document.getElementById(TYPING_CONTAINER_ID)) return;
    const container = document.createElement("div");
    container.id = TYPING_CONTAINER_ID;
    hud.append(container);
  }

  clear() {
    this.#bubbles.clear();
    this.element?.replaceChildren();
    for (const indicator of this.#typing.values()) indicator.element.remove();
    this.#typing.clear();
    clearTimeout(this.#timer);
    this.#timer = null;
  }

  /** Mostra um balão para `token`; `content` é HTML já enriquecido. */
  say({ id = foundry.utils.randomID(), token, kind = KINDS.SAY, content, name = token.name, icon, iconClass }) {
    const portrait = getSetting(SETTINGS.BUBBLE_PORTRAIT) ? token.document.texture.src : null;
    return this.#show({ id, kind, content, name, portrait, icon, iconClass, tokenId: token.id, anchorX: token.center.x });
  }

  /** Liga ou desliga o selo de digitação no canto do token. */
  setTyping(tokenId, active, label) {
    const existing = this.#typing.get(tokenId);
    if (!active) {
      existing?.element.remove();
      this.#typing.delete(tokenId);
      return;
    }
    const container = document.getElementById(TYPING_CONTAINER_ID);
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
    if (bubble) this.#retire(bubble);
  }

  /** `visible` é verdadeiro para todos num sussurro com rolagem; `isContentVisible` é o que não vaza. */
  async onMessage(message) {
    if (!message.isContentVisible) return;
    const kind = resolveKind(message);
    if (kind === KINDS.NARRATION) return this.#narrate(message);
    if (!this.isActive) return;
    const usage = getSetting(SETTINGS.USAGE_BUBBLES) ? resolveUsage(message) : null;
    if (usage) return this.#announceUsage(message, usage);
    const token = speakerToken(message);
    if (token) return this.#speak(message, kind, token);
    if (isTalk(message) && isCurrentScene(message)) return this.#speakAside(message, kind);
  }

  /** O balão de uso é um resumo; um update do cartão não pode trocá-lo pelo HTML inteiro. */
  async onMessageUpdated(message, changed) {
    const bubble = this.#bubbles.get(message.id);
    if (!bubble || bubble.kind === USAGE_KIND || !("content" in changed)) return;
    bubble.setContent(await enrich(message));
    this.#rearrange(this.#measure());
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

  /**
   * Token que este cliente não vê não ganha balão: na faixa, o balão escondido abriria um buraco e empurraria os
   * vizinhos, denunciando que alguém falou ali.
   */
  async #speak(message, kind, token) {
    if (!isSpeech(message) || !BUBBLE_KINDS.has(kind)) return;
    this.setTyping(token.id, false);
    if (!token.visible) return;
    await this.say({ id: message.id, token, kind, content: await enrich(message), name: message.alias });
  }

  /**
   * Conversa da cena vista cujo falante não tem token nela, como um jogador fora do mapa, sai no meio da faixa. Uma
   * fala cujo token está na cena nunca vem para cá, mesmo que este cliente não o veja: aqui ela denunciaria quem está
   * escondido. O comando do Mestre sem token sai sem nome.
   */
  async #speakAside(message, kind) {
    const portrait = getSetting(SETTINGS.BUBBLE_PORTRAIT) ? speakerImage(message) : null;
    const look = isMasterVoice(message) ? {} : { name: message.alias, portrait };
    await this.#show({ id: message.id, kind, content: await enrich(message), ...look });
  }

  /** A narração, de qualquer cena e mesmo sem cena, sai no meio da faixa com o nome e o pergaminho do narrador. */
  async #narrate(message) {
    if (!getSetting(SETTINGS.NARRATION_BANNER)) return;
    const content = await enrich(message);
    await this.#show({ id: message.id, kind: KINDS.NARRATION, content, name: message.alias, portraitIcon: NARRATOR_ICON, isNarration: true });
  }

  /**
   * Token que este cliente não vê não ganha balão, como na fala. Sistemas que gravam só o ator caem no único token dele
   * na cena.
   */
  #announceUsage(message, usage) {
    const token = message.speaker.token ? speakerToken(message) : actorToken(usage.actor);
    if (!token?.visible || isRepeatedUsage(message, usage)) return;
    const name = usageName(message, usage.actor, token);
    const key = usage.isRoll ? "TBG.Usage.rolled" : "TBG.Usage.used";
    const content = localize(key, { name: strong(name), label: strong(usage.label) });
    const iconClass = usage.img ? null : ROLL_ICON;
    return this.say({ id: message.id, token, kind: USAGE_KIND, content, name: null, icon: usage.img, iconClass });
  }

  /** Põe o balão na linha de nascimento e abre espaço empurrando para cima os que ele encosta. */
  async #show({ id, isNarration = false, ...look }) {
    const container = this.element;
    if (!container) return null;
    this.remove(id);
    const bubble = await Bubble.create({ id, ...look });
    const metrics = this.#measure();
    this.#place(container, bubble, metrics);
    this.#bubbles.set(id, bubble);
    this.#row = Math.min(...[...this.#bubbles.values()].map(other => other.height)) + GAP;
    if (isNarration) bubble.hopEvery = this.#narrationHopEvery(bubble, metrics);
    this.#lastBirth = performance.now();
    this.#zoom = canvas.ready ? canvas.stage.scale.x : null;
    this.#rearrange(metrics);
    bubble.show();
    this.#expireLater(bubble, isNarration ? NARRATION_MIN_MS : 0);
    this.#schedule();
    return bubble;
  }

  /**
   * O balão entra já pintado na linha de nascimento, senão a transição do pulo o traria do topo da tela; só depois de
   * medido ele se encosta na parte visível.
   */
  #place(container, bubble, metrics) {
    const bounds = visibleBounds(metrics.scale);
    bubble.x = bubble.isAnchored ? bandX(bubble.anchorX, metrics.scale) : (bounds.left + bounds.right) / 2;
    bubble.paint(metrics.baseline);
    container.append(bubble.element);
    bubble.measure();
    bubble.fit(bounds);
  }

  /** Medidas da faixa, em pixels dela: ela escala com a interface (`--ui-scale`), como as colunas do core. */
  #measure() {
    const scale = Number(getComputedStyle(document.body).getPropertyValue("--ui-scale")) || 1;
    const baseline = Math.min(getSetting(SETTINGS.BUBBLE_RISE_LIMIT), (innerHeight / scale) * MAX_BASELINE_RATIO);
    this.#metrics = { scale, baseline };
    return this.#metrics;
  }

  /** De quantos em quantos pulos o narrador sobe para levar meio minuto até o topo quando nada o empurra. */
  #narrationHopEvery(bubble, { baseline }) {
    const speed = getSetting(SETTINGS.BUBBLE_RISE_SPEED);
    if (speed <= 0) return 1;
    const hops = Math.floor((baseline - bubble.height) / this.#row) + 1;
    return Math.max(1, Math.ceil((NARRATION_MIN_MS * speed) / (hops * this.#row * 1000)));
  }

  /** O *Tempo máximo* tira o balão onde ele estiver; o do narrador fica pelo menos meio minuto mesmo assim. */
  #expireLater(bubble, minimumMs) {
    const seconds = getSetting(SETTINGS.BUBBLE_MAX_LIFETIME);
    if (seconds > 0) setTimeout(() => this.#retire(bubble), Math.max(seconds * 1000, minimumMs));
  }

  #schedule() {
    const speed = getSetting(SETTINGS.BUBBLE_RISE_SPEED);
    if (this.#timer !== null || !this.#bubbles.size || speed <= 0) return;
    this.#timer = setTimeout(this.#hop, (this.#row / speed) * 1000);
  }

  /** Um pulo: todos sobem uma linha, menos o narrador fora da vez dele; logo depois de um balão nascer, espera. */
  #hop = () => {
    this.#timer = null;
    if (!this.#bubbles.size) return;
    const wait = this.#lastBirth + DWELL_MS - performance.now();
    if (wait > 0) {
      this.#timer = setTimeout(this.#hop, wait);
      return;
    }
    this.#hops++;
    for (const bubble of this.#bubbles.values()) {
      if (this.#hops % bubble.hopEvery === 0) bubble.lift += this.#row;
    }
    this.#rearrange(this.#measure());
    this.#schedule();
  };

  /** O pan leva os balões dos tokens junto, só na horizontal; um zoom muda as distâncias e pode encostar balões. */
  #follow() {
    if (!this.#metrics || !canvas.ready) return;
    let hasAnchored = false;
    for (const bubble of this.#bubbles.values()) {
      if (!bubble.isAnchored) continue;
      bubble.x = bandX(bubble.anchorX, this.#metrics.scale) + bubble.shift;
      hasAnchored = true;
    }
    if (!hasAnchored) return;
    const zoom = canvas.stage.scale.x;
    if (zoom === this.#zoom) return this.#paintAll(this.#metrics);
    this.#zoom = zoom;
    this.#rearrange(this.#metrics);
  }

  /** Desfaz as sobreposições, pinta e apaga quem passou do topo, já pintado no pulo que o levou para fora. */
  #rearrange(metrics) {
    this.#settle();
    this.#paintAll(metrics);
    for (const bubble of this.#bubbles.values()) {
      if (bubble.ceiling > metrics.baseline) this.#retire(bubble);
    }
  }

  /**
   * Só sobe balões: de baixo para cima, e o mais novo primeiro no empate, cada um passa por cima dos que já ficaram
   * embaixo e encostam nele. Em free flow encostar é cruzar na horizontal também; linha a linha, basta a altura.
   */
  #settle() {
    const isLine = getSetting(SETTINGS.BUBBLE_LAYOUT) === BUBBLE_LAYOUTS.LINE;
    const placed = [];
    const ordered = [...this.#bubbles.values()].sort((a, b) => a.lift - b.lift || b.createdAt - a.createdAt);
    for (const bubble of ordered) {
      let blocker = placed.find(other => collides(bubble, other, isLine));
      while (blocker) {
        bubble.lift = blocker.ceiling + GAP;
        blocker = placed.find(other => collides(bubble, other, isLine));
      }
      placed.push(bubble);
    }
  }

  #paintAll({ baseline }) {
    for (const bubble of this.#bubbles.values()) bubble.paint(baseline);
  }

  #retire(bubble) {
    if (this.#bubbles.get(bubble.id) !== bubble) return;
    this.#bubbles.delete(bubble.id);
    bubble.fadeOut();
  }
}

function collides(a, b, isLine) {
  const isStacked = a.lift < b.ceiling + GAP && b.lift < a.ceiling + GAP;
  return isStacked && (isLine || (a.left < b.right + GAP && b.left < a.right + GAP));
}

/** Onde um x do mapa cai na faixa. O hook de pan chega antes de o PIXI refazer as matrizes, então a conta usa o palco. */
function bandX(worldX, scale) {
  const { pivot, position, scale: zoom } = canvas.stage;
  return ((worldX - pivot.x) * zoom.x + position.x) / scale;
}

/** A parte da faixa que se vê: entre os botões e a lista de cenas, à esquerda, e a barra lateral, à direita. */
function visibleBounds(scale) {
  const left = Math.max(0, ...[ui.controls, ui.nav].map(app => visibleRight(app?.element)));
  const right = ui.sidebar?.element?.getBoundingClientRect().left ?? innerWidth;
  return { left: left / scale + EDGE, right: right / scale - EDGE };
}

function visibleRight(element) {
  const rect = element?.getBoundingClientRect();
  return rect?.height ? rect.right : 0;
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

/** Ativa a faixa dos balões. */
export function registerBubbles() {
  bubbleLayer.activate();
}
