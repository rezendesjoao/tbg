import { ANONYMOUS_KINDS, TEMPLATES } from "../constants.mjs";

const MARGIN = 12;
const FADE_MS = 250;

/**
 * Um balão ancorado a um token. Os deslocamentos são em pixels de tela e viram
 * coordenadas de mundo no layout, que usa `transform` para não recalcular leiaute a cada quadro.
 */
export default class Bubble {
  rise = 0;
  pushTarget = 0;
  pushOffset = 0;
  width = 0;
  height = 0;
  createdAt = performance.now();

  constructor({ id, token, kind, element }) {
    this.id = id;
    this.token = token;
    this.kind = kind;
    this.element = element;
  }

  /** Renderiza o balão de fala. */
  static async create({ id, token, kind, content, name, portrait }) {
    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.bubble, {
      id,
      tokenId: token.id,
      kind,
      content,
      name,
      portrait,
      showName: !ANONYMOUS_KINDS.has(kind)
    });
    return new Bubble({ id, token, kind, element: foundry.utils.parseHTML(html) });
  }

  get tokenId() {
    return this.token.id;
  }

  get offset() {
    return this.rise + this.pushOffset;
  }

  get targetOffset() {
    return this.rise + this.pushTarget;
  }

  measure() {
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
  }

  /** Retângulo visual no mundo na posição alvo, para testes de sobreposição. */
  rect(scale) {
    const { x, y } = this.anchor(scale);
    const halfWidth = (this.width * scale) / 2;
    const bottom = y - this.targetOffset * scale;
    return { left: x - halfWidth, right: x + halfWidth, top: bottom - this.height * scale, bottom };
  }

  layout(scale) {
    const { x, y } = this.anchor(scale);
    const left = x - (this.width * scale) / 2;
    const top = y - (this.offset + this.height) * scale;
    this.element.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
    this.element.style.visibility = this.token.visible ? "" : "hidden";
  }

  show() {
    this.element.classList.add("tbg-bubble--visible");
  }

  /** Conclui o empurrão sem esperar o relógio, que não roda com a aba oculta (requestAnimationFrame suspenso). */
  settlePush() {
    this.pushOffset = this.pushTarget;
  }

  setContent(content) {
    this.element.querySelector(".tbg-bubble__text").innerHTML = content;
    this.measure();
  }

  /** A promessa da animação não resolve enquanto a aba não desenha, então a remoção é agendada por tempo. */
  fadeOut() {
    this.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: "ease", fill: "forwards" });
    setTimeout(() => this.element.remove(), FADE_MS);
  }

  anchor(scale) {
    return { x: this.token.center.x, y: this.token.document.y - MARGIN * scale };
  }
}
