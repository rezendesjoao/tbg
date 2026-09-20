import { CHAT_MAX_LENGTH, INPUT_CHANGED } from "../constants.mjs";

const CLASS = "tbg-char-count";
const RAMP_START = 0.5;

let length = 0;

/** Mostra quantos caracteres foram digitados e quanto falta para o limite. */
export function registerCharacterCounter() {
  Hooks.on("renderChatInput", (_chatLog, elements) => mount(elements["#chat-controls"]));
  Hooks.on(INPUT_CHANGED, typed);
}

function mount(controls) {
  if (!controls || controls.querySelector(`.${CLASS}`)) return;
  const counter = document.createElement("span");
  counter.className = CLASS;
  controls.prepend(counter);
  render();
}

function typed(typedLength) {
  length = typedLength;
  render();
}

function render() {
  const counter = document.querySelector(`.${CLASS}`);
  if (!counter) return;
  counter.textContent = `${length}/${CHAT_MAX_LENGTH}`;
  counter.style.setProperty("--tbg-char-ratio", redness());
}

/** Fração de vermelho: branco até metade do limite, vermelho pleno ao encostar nele. */
function redness() {
  return Math.clamp((length / CHAT_MAX_LENGTH - RAMP_START) / (1 - RAMP_START), 0, 1);
}
