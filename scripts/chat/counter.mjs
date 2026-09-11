import { INPUT_CHANGED, LIMIT_CHANGED } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";

const CLASS = "tbg-char-count";
const WARNING_RATIO = 0.9;

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
  counter.classList.toggle(`${CLASS}--full`, Boolean(max) && length >= max);
  counter.classList.toggle(`${CLASS}--near`, Boolean(max) && length >= max * WARNING_RATIO && length < max);
  counter.hidden = length === 0 && !max;
}
