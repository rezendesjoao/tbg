import { TEMPLATES } from "../constants.mjs";

const FADE_MS = 250;

/**
 * Um balão da faixa do topo da tela. `lift` é quanto a base dele já subiu desde a linha onde os balões nascem e `x` é o
 * meio dele, os dois em pixels da faixa. O balão de um token guarda o x do token no mapa (`anchorX`) e o desvio que o
 * fez caber na tela (`shift`), para acompanhar o pan; os outros nascem no meio e ficam lá.
 */
export default class Bubble {
  lift = 0;
  x = 0;
  shift = 0;
  width = 0;
  height = 0;
  hopEvery = 1;
  createdAt = performance.now();
  #paintedX = null;
  #paintedY = null;

  constructor({ id, kind, anchorX, element }) {
    this.id = id;
    this.kind = kind;
    this.anchorX = anchorX;
    this.element = element;
  }

  /**
   * Renderiza o balão. Sem `name`, sai sem cabeçalho; `portraitIcon` é um ícone Font Awesome no lugar do retrato, como o
   * pergaminho do narrador; `icon` e `iconClass` são a imagem ou o ícone do balão de uso, que já traz o nome no texto.
   */
  static async create({ id, kind, content, name, portrait, portraitIcon, icon, iconClass, tokenId, anchorX = null }) {
    const context = { id, kind, content, name, portrait, portraitIcon, icon, iconClass, tokenId };
    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.bubble, context);
    return new Bubble({ id, kind, anchorX, element: foundry.utils.parseHTML(html) });
  }

  get isAnchored() {
    return this.anchorX !== null;
  }

  get left() {
    return this.x - this.width / 2;
  }

  get right() {
    return this.x + this.width / 2;
  }

  /** Altura do topo do balão acima da linha de nascimento. */
  get ceiling() {
    return this.lift + this.height;
  }

  measure() {
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
  }

  /** Encosta o balão na parte visível da faixa; o de um token guarda o desvio para acompanhar o pan. */
  fit({ left, right }) {
    const half = this.width / 2;
    const x = right - left < this.width ? (left + right) / 2 : Math.min(Math.max(this.x, left + half), right - half);
    this.shift += x - this.x;
    this.x = x;
  }

  /**
   * Põe a base do balão a `lift` pixels acima de `baseline`. O x vai no `translate`, que não tem transição, para o pan
   * não arrastar; o y vai no `transform`, cuja transição curta é o pulo. Só escreve o que mudou.
   */
  paint(baseline) {
    const x = Math.round(this.x);
    const y = Math.round(baseline - this.lift);
    if (x !== this.#paintedX) this.element.style.translate = `calc(${x}px - 50%) -100%`;
    if (y !== this.#paintedY) this.element.style.transform = `translate3d(0, ${y}px, 0)`;
    this.#paintedX = x;
    this.#paintedY = y;
  }

  show() {
    this.element.classList.add("tbg-bubble--visible");
  }

  setContent(content) {
    this.element.querySelector(".tbg-bubble__text").innerHTML = content;
    this.measure();
  }

  /** A promessa da animação não resolve enquanto a aba não desenha, então a remoção é agendada por tempo. */
  fadeOut() {
    if (document.body.classList.contains("performance-low")) return this.element.remove();
    this.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: "ease", fill: "forwards" });
    setTimeout(() => this.element.remove(), FADE_MS);
  }
}
