import { KINDS } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { resolveKind } from "../chat/kinds.mjs";
import Banner from "./banner.mjs";

const CONTAINER_ID = "tbg-banners";
const MOUNT_ID = "ui-middle";
const GAP = 12;
const MAX_BANNERS = 3;

/**
 * Letreiros de narração no meio da tela, para todos. Vivem em `#ui-middle`, que é estático e fica entre as
 * colunas da interface: acima do canvas e do HUD, abaixo de janelas e notificações, sem depender da cena.
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
    if (!getSetting(SETTINGS.NARRATION_BANNER) || !isVisibleNarration(message)) return;
    await this.show({ id: message.id, name: message.alias, content: await enrich(message) });
  }

  /** O texto editado muda a altura; os letreiros mais antigos, que estão acima, andam junto para não sobrepor. */
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
  async show({ id, name, content }) {
    const container = this.element;
    if (!container) return;
    this.remove(id);
    const minimumSeconds = getSetting(SETTINGS.NARRATION_BANNER_DURATION);
    const banner = await Banner.create({ id, name, content, minimumSeconds });
    container.append(banner.element);
    banner.measure();
    for (const other of this.#banners.values()) other.pushBy(banner.height + GAP);
    this.#banners.set(id, banner);
    this.#trim();
    banner.play(container.offsetHeight, { reducedMotion: prefersReducedMotion() });
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

function isVisibleNarration(message) {
  return resolveKind(message) === KINDS.NARRATION && message.isContentVisible;
}

function prefersReducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches || game.settings.get("core", "photosensitiveMode");
}

function enrich(message) {
  return foundry.applications.ux.TextEditor.implementation.enrichHTML(message.content, { secrets: game.user.isGM });
}

/** Ativa os letreiros de narração. */
export function registerBanners() {
  new BannerLayer().activate();
}
