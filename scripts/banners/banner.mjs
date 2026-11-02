import { TEMPLATES } from "../constants.mjs";

const START_RATIO = 0.4;
const FADE_IN_MS = 400;
const FADE_OUT_MS = 1000;
const PUSH_MS = 200;
const DISMISS_MS = 250;
const BASE_MS = 2000;
const PER_CHARACTER_MS = 60;
const MIN_DURATION_MS = 2000;
const MAX_DURATION_MS = 60000;

/**
 * Um balão no meio da tela: o mesmo balão dos jogadores, que nasce um pouco acima do meio, sobe devagar e some. O
 * do narrador é preto e tem o nome dele; o comando do Mestre sem token não tem nome. A subida anima o `transform` do
 * balão e o empurrão anima o `translate` do elemento externo, então os dois compõem sem conflito.
 */
export default class Banner {
  push = 0;
  height = 0;

  constructor({ id, element, readingMs }) {
    this.id = id;
    this.element = element;
    this.duration = readingMs;
  }

  /**
   * Renderiza o balão; fica pelo menos `minimumMs`, textos longos pedem mais tempo de leitura, e `maximumMs` (ou um
   * minuto) é o teto. Sem `name`, sai sem cabeçalho.
   */
  static async create({ id, kind, name, portrait, iconClass, content, minimumMs, maximumMs }) {
    const context = { id, kind, name, portrait, iconClass, content };
    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.banner, context);
    const element = foundry.utils.parseHTML(html);
    const length = element.querySelector(".tbg-bubble__text").textContent.trim().length;
    const readingMs = Math.min(maximumMs || MAX_DURATION_MS, Math.max(minimumMs, BASE_MS + length * PER_CHARACTER_MS));
    return new Banner({ id, element, readingMs });
  }

  get card() {
    return this.element.querySelector(".tbg-banner__card");
  }

  get text() {
    return this.element.querySelector(".tbg-bubble__text");
  }

  measure() {
    this.height = this.element.offsetHeight;
  }

  /**
   * Todos sobem na mesma velocidade, em pixels por milissegundo, senão um balão curto alcançaria o longo que ele
   * empurrou. O tempo encurta se o balão chegaria ao topo antes de sumir. Medidas em pixels do container, porque
   * `getBoundingClientRect` viria escalado pelo `--ui-scale` do `#ui-middle`.
   */
  play(containerHeight, { speed }) {
    const top = containerHeight * START_RATIO - this.height;
    this.element.style.top = `${top}px`;
    if (speed) this.duration = Math.max(MIN_DURATION_MS, Math.min(this.duration, top / speed));
    this.card.animate([
      { transform: "translateY(0)", opacity: 0 },
      { opacity: 1, offset: FADE_IN_MS / this.duration },
      { opacity: 1, offset: 1 - FADE_OUT_MS / this.duration },
      { transform: `translateY(${-speed * this.duration}px)`, opacity: 0 }
    ], { duration: this.duration, easing: "linear", fill: "forwards" });
  }

  /** Grava o valor final antes de animar, para a posição ficar certa mesmo se a aba não desenhar. */
  pushBy(distance) {
    const from = `0 ${-this.push}px`;
    this.push += distance;
    const to = `0 ${-this.push}px`;
    this.element.style.translate = to;
    this.element.animate([{ translate: from }, { translate: to }], { duration: PUSH_MS, easing: "ease" });
  }

  /** Troca o texto mantendo a base no lugar e devolve quanto a altura mudou, para empurrar os de cima. */
  setContent(content) {
    const previous = this.height;
    this.text.innerHTML = content;
    this.measure();
    const delta = this.height - previous;
    this.element.style.top = `${parseFloat(this.element.style.top) - delta}px`;
    return delta;
  }

  /** A promessa da animação não resolve com a aba parada, então a remoção é agendada por tempo. */
  dismiss() {
    this.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DISMISS_MS, easing: "ease", fill: "forwards" });
    setTimeout(() => this.element.remove(), DISMISS_MS);
  }
}
