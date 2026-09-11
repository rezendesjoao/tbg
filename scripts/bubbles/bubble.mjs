import { KINDS, TEMPLATES } from "../constants.mjs";

const MARGIN = 12;

/** Um balão ancorado a um token; deslocamentos em pixels de tela, convertidos para o mundo no layout. */
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

  /** Renderiza o template e devolve o balão pronto para entrar no DOM. */
  static async create({ id, token, kind, content, name, portrait }) {
    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.bubble, {
      id,
      tokenId: token.id,
      kind,
      content,
      name,
      portrait,
      showName: kind !== KINDS.ACTION
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
    const { style } = this.element;
    style.left = `${x - this.width / 2}px`;
    style.top = `${y - this.offset * scale - this.height}px`;
    style.transform = scale === 1 ? "" : `scale(${scale})`;
    style.visibility = this.token.visible ? "" : "hidden";
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

  async fadeOut() {
    await this.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, easing: "ease" }).finished;
    this.element.remove();
  }

  anchor(scale) {
    return { x: this.token.center.x, y: this.token.document.y - MARGIN * scale };
  }
}
