import { KINDS } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { isMasterVoice, isTalk, resolveKind } from "../chat/kinds.mjs";
import { speakerImage, speakerToken } from "../chat/speaker.mjs";
import { isCurrentScene } from "../history/scene.mjs";
import { bubbleLayer } from "../bubbles/layer.mjs";
import Banner from "./banner.mjs";

const CONTAINER_ID = "tbg-banners";
const MOUNT_ID = "ui-middle";
const GAP = 12;
const MAX_BANNERS = 3;
const NARRATOR_ICON = "fa-solid fa-scroll";

/**
 * Balões no meio da tela, para o que não tem token onde aparecer: a narração, com o nome do narrador, e a conversa
 * sem token na cena, como a do Mestre sem token selecionado, que sai sem nome. Vivem em `#ui-middle`, que é estático
 * e fica entre as colunas da interface: acima do canvas e do HUD, abaixo de janelas e notificações.
 */
class BannerLayer {
  #banners = new Map();

  activate() {
    Hooks.once("ready", () => this.mount());
    Hooks.on("createChatMessage", message => this.onMessage(message));
    Hooks.on("updateChatMessage", (message, changed) => this.onMessageUpdated(message, changed));
    Hooks.on("deleteChatMessage", message => this.remove(message.id));
  }

  get element() {
    return document.getElementById(CONTAINER_ID);
  }

  mount() {
    const parent = document.getElementById(MOUNT_ID);
    if (!parent || this.element) return;
    const container = document.createElement("div");
    container.id = CONTAINER_ID;
    parent.append(container);
  }

  async onMessage(message) {
    const look = bannerLook(message);
    if (!look) return;
    await this.show({ id: message.id, ...look, content: await enrich(message) });
  }

  /** O texto editado muda a altura; os balões mais antigos, que estão acima, andam junto para não sobrepor. */
  async onMessageUpdated(message, changed) {
    if (!("content" in changed) || !this.#banners.has(message.id)) return;
    const content = await enrich(message);
    const banner = this.#banners.get(message.id);
    if (!banner) return;
    const delta = banner.setContent(content);
    if (!delta) return;
    for (const other of this.#banners.values()) {
      if (other === banner) break;
      other.pushBy(delta);
    }
  }

  /** O novo nasce na base e empurra os que estão na tela, como os balões no modo linha a linha. */
  async show({ id, ...look }) {
    const container = this.element;
    if (!container) return;
    this.remove(id);
    const minimumSeconds = getSetting(SETTINGS.NARRATION_BANNER_DURATION);
    const banner = await Banner.create({ id, ...look, minimumSeconds });
    container.append(banner.element);
    banner.measure();
    for (const other of this.#banners.values()) other.pushBy(banner.height + GAP);
    this.#banners.set(id, banner);
    this.#trim();
    banner.play(container.offsetHeight, { speed: riseSpeed() });
    setTimeout(() => this.#expire(banner), banner.duration);
  }

  remove(id) {
    const banner = this.#banners.get(id);
    if (!banner) return;
    this.#banners.delete(id);
    banner.dismiss();
  }

  #trim() {
    while (this.#banners.size > MAX_BANNERS) this.remove(this.#banners.keys().next().value);
  }

  #expire(banner) {
    if (this.#banners.get(banner.id) !== banner) return;
    this.#banners.delete(banner.id);
    banner.element.remove();
  }
}

/**
 * Como o balão sai, ou null quando a mensagem não vai para o meio da tela. Uma fala cujo token está na cena tem o
 * balão sobre ele, mesmo que este cliente não veja o token: no meio da tela, ela denunciaria quem está escondido.
 */
function bannerLook(message) {
  if (!message.isContentVisible) return null;
  const kind = resolveKind(message);
  if (kind === KINDS.NARRATION) {
    return getSetting(SETTINGS.NARRATION_BANNER) ? { kind, name: message.alias, iconClass: NARRATOR_ICON } : null;
  }
  if (!bubbleLayer.isActive || !isTalk(message) || speakerToken(message) || !isCurrentScene(message)) return null;
  if (isMasterVoice(message)) return { kind };
  const portrait = getSetting(SETTINGS.BUBBLE_PORTRAIT) ? speakerImage(message) : null;
  return { kind, name: message.alias, portrait };
}

/** A mesma velocidade dos balões sobre os tokens, em pixels por milissegundo; parado com movimento reduzido. */
function riseSpeed() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || game.settings.get("core", "photosensitiveMode");
  return reduced ? 0 : getSetting(SETTINGS.BUBBLE_RISE_SPEED) / 1000;
}

function enrich(message) {
  return foundry.applications.ux.TextEditor.implementation.enrichHTML(message.content, { secrets: game.user.isGM });
}

/** Ativa os balões do meio da tela. */
export function registerBanners() {
  new BannerLayer().activate();
}
