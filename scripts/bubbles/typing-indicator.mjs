const SIZE_RATIO = 0.22;
const MIN_SIZE = 12;
const WIDTH_FACTOR = 1.6;
const INSET_RATIO = 0.12;
const DOTS = 3;

/** Selo de "digitando" encaixado no canto superior direito da arte do token. */
export default class TypingIndicator {
  constructor({ token, element }) {
    this.token = token;
    this.element = element;
  }

  /** Montado por DOM, sem template assíncrono: um `hide` nunca chega antes do elemento existir. */
  static create({ token, label }) {
    const element = document.createElement("div");
    element.className = "tbg-typing";
    element.dataset.tokenId = token.id;
    element.ariaLabel = label;
    for (let index = 0; index < DOTS; index++) {
      const dot = document.createElement("span");
      dot.className = "tbg-typing__dot";
      element.append(dot);
    }
    return new TypingIndicator({ token, element });
  }

  get tokenId() {
    return this.token.id;
  }

  /** Acompanha a arte do token, então não usa a escala de tela dos balões: encolhe e cresce com o mapa. */
  layout() {
    const size = Math.max(MIN_SIZE, Math.min(this.token.w, this.token.h) * SIZE_RATIO);
    const width = size * WIDTH_FACTOR;
    const inset = size * INSET_RATIO;
    const left = this.token.document.x + this.token.w - width - inset;
    const top = this.token.document.y + inset;
    const { style } = this.element;
    style.setProperty("--tbg-typing-size", `${size}px`);
    style.setProperty("--tbg-typing-width", `${width}px`);
    style.transform = `translate3d(${left}px, ${top}px, 0)`;
    style.visibility = this.token.visible ? "" : "hidden";
  }

  show() {
    this.element.classList.add("tbg-typing--visible");
  }
}
