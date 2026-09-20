import { INPUT_CHANGED, LIMIT_CHANGED } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";

const CLASS = "tbg-char-count";
const RAMP_START = 0.5;

let length = 0;

/** Mostra quantos caracteres foram digitados e quanto falta para o limite. */
export function registerCharacterCounter() {
  Hooks.on("renderChatInput", (_chatLog, elements) => mount(elements["#chat-controls"]));
  Hooks.on(INPUT_CHANGED, typed);
  Hooks.on(LIMIT_CHANGED, render);
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
  const max = getSetting(SETTINGS.CHAT_MAX_LENGTH);
  counter.textContent = max ? `${length}/${max}` : String(length);
  counter.style.setProperty("--tbg-char-ratio", redness(length, max));
  counter.hidden = length === 0 && !max;
}

/** Fração de vermelho: branco até metade do limite, vermelho pleno ao encostar nele. */
function redness(used, max) {
  if (!max) return 0;
  return Math.clamp((used / max - RAMP_START) / (1 - RAMP_START), 0, 1);
}
