import { CHAT_MAX_LENGTH, INPUT_BLURRED, INPUT_CHANGED, MODULE_ID, NARRATOR_CHANGED, TEMPLATES } from "../constants.mjs";
import { localize } from "../utils.mjs";
import { isNarratorActive, narratorName, toggleNarrator } from "./narrator.mjs";

const MOUNT_ID = "ui-bottom";
const RAMP_START = 0.5;
const RECALL_SIZE = 20;
const MASTER_ICON = "fa-solid fa-crown";
const NARRATOR_ICON = "fa-solid fa-scroll";
const NO_ART_ICON = "fa-solid fa-user";

/**
 * A barra de conversa no pé da tela, acima da barra de macros ou do que tomou o lugar dela: é onde todo mundo
 * digita, como nas salas de bate-papo dos jogos. Enter fala, Shift+Enter grita, Esc sai do campo e as setas
 * trazem de volta o que você já mandou.
 */
class ChatBar {
  #element = null;
  #sent = [];
  #recall = -1;
  #draft = "";

  get input() {
    return this.#element?.querySelector(".tbg-bar__input") ?? null;
  }

  /** Liga os hooks que mantêm em dia quem fala pela barra. Chamar uma vez no `init`. */
  activate() {
    Hooks.once("ready", () => this.mount());
    for (const hook of ["controlToken", "canvasReady", NARRATOR_CHANGED]) Hooks.on(hook, () => this.syncSpeaker());
    Hooks.on("updateUser", user => user.isSelf && this.syncSpeaker());
    Hooks.on("updateToken", token => token.object?.controlled && this.syncSpeaker());
  }

  /** Primeiro filho de `#ui-bottom`: a barra fica acima de tudo o que mora no pé da tela. */
  async mount() {
    const parent = document.getElementById(MOUNT_ID);
    if (!parent || this.#element) return;
    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.chatBar, {
      maxLength: CHAT_MAX_LENGTH,
      label: localize("TBG.Bar.label"),
      placeholder: localize("TBG.Bar.placeholder")
    });
    this.#element = foundry.utils.parseHTML(html);
    parent.prepend(this.#element);
    this.#listen();
    this.syncSpeaker();
    this.#count(0);
  }

  /** Leva o cursor para o campo e devolve se havia campo. */
  focus() {
    this.input?.focus();
    return !!this.input;
  }

  /** Quem fala: o token selecionado, o personagem, a coroa do Mestre sem token ou o pergaminho do narrador. */
  syncSpeaker() {
    const button = this.#element?.querySelector(".tbg-bar__speaker");
    if (!button) return;
    const { image, icon, label } = speakerView();
    const portrait = button.querySelector(".tbg-bar__portrait");
    const symbol = button.querySelector(".tbg-bar__icon");
    portrait.hidden = !image;
    if (image) portrait.src = image;
    symbol.hidden = !icon;
    symbol.className = `tbg-bar__icon ${icon ?? ""}`;
    button.ariaLabel = label;
  }

  #listen() {
    const input = this.input;
    input.addEventListener("keydown", event => this.#onKeyDown(event));
    input.addEventListener("beforeinput", event => this.#onBeforeInput(event));
    input.addEventListener("input", () => this.#onTyped());
    input.addEventListener("blur", () => Hooks.callAll(INPUT_BLURRED));
    const button = this.#element.querySelector(".tbg-bar__speaker");
    button.addEventListener("click", () => (game.user.isGM ? toggleNarrator() : this.focus()));
  }

  /** As teclas tratadas aqui não seguem para os atalhos do Foundry: sem isso, o Esc também soltaria o token. */
  #onKeyDown(event) {
    if (event.isComposing) return;
    const handlers = {
      Enter: () => this.#send(event.shiftKey),
      Escape: () => this.input.blur(),
      ArrowUp: () => this.#browse(1),
      ArrowDown: () => this.#browse(-1)
    };
    const handler = handlers[event.key];
    if (!handler) return;
    event.preventDefault();
    event.stopPropagation();
    handler();
  }

  /** O limite recusa a digitação ou a colagem inteira, sem cortar o texto pelas costas; apagar sempre passa. */
  #onBeforeInput(event) {
    if (event.isComposing || !event.inputType.startsWith("insert")) return;
    const { value, selectionStart, selectionEnd } = this.input;
    const added = event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
    if (value.length - (selectionEnd - selectionStart) + added.length > CHAT_MAX_LENGTH) event.preventDefault();
  }

  #onTyped() {
    this.#recall = -1;
    this.#announce();
  }

  #announce() {
    const { length } = this.input.value;
    this.#count(length);
    Hooks.callAll(INPUT_CHANGED, length);
  }

  /** Setas: a mais recente primeiro; descer além dela devolve o rascunho que estava no campo. */
  #browse(step) {
    const index = Math.clamp(this.#recall + step, -1, this.#sent.length - 1);
    if (index === this.#recall) return;
    if (this.#recall === -1) this.#draft = this.input.value;
    this.#recall = index;
    this.input.value = index === -1 ? this.#draft : this.#sent[index];
    this.#announce();
  }

  /** O campo esvazia na hora, para a conversa correr; se o envio falhar, o texto volta. */
  async #send(shout) {
    const input = this.input;
    const text = input.value.trim();
    if (!text) return;
    this.#remember(text);
    input.value = "";
    this.#announce();
    const message = commandFor(escapeText(text), shout);
    try {
      await ui.chat.processMessage(message);
    } catch (error) {
      if (!input.value) input.value = text;
      this.#count(input.value.length);
      Hooks.onError("ChatLog#processMessage", error, { notify: "error", log: "error", message });
    }
  }

  #remember(text) {
    if (this.#sent[0] !== text) this.#sent.unshift(text);
    this.#sent.length = Math.min(this.#sent.length, RECALL_SIZE);
    this.#recall = -1;
    this.#draft = "";
  }

  #count(length) {
    const counter = this.#element.querySelector(".tbg-bar__count");
    counter.textContent = `${length}/${CHAT_MAX_LENGTH}`;
    counter.style.setProperty("--tbg-char-ratio", redness(length));
  }
}

function speakerView() {
  if (isNarratorActive()) return { icon: NARRATOR_ICON, label: localize("TBG.Bar.narrating", { name: narratorName() }) };
  const { actor, token, alias } = ChatMessage.implementation.getSpeaker();
  if (token || actor) {
    const image = canvas.tokens?.get(token)?.document.texture.src ?? game.actors.get(actor)?.img ?? null;
    return { image, icon: image ? null : NO_ART_ICON, label: localize("TBG.Bar.speaking", { name: alias }) };
  }
  if (game.user.isGM) return { icon: MASTER_ICON, label: localize("TBG.Bar.master") };
  return { image: game.user.avatar, label: localize("TBG.Bar.offCharacter") };
}

/** Fração de vermelho do contador: nada até a metade do limite, vermelho pleno ao encostar nele. */
function redness(length) {
  return Math.clamp((length / CHAT_MAX_LENGTH - RAMP_START) / (1 - RAMP_START), 0, 1);
}

/** O conteúdo de uma mensagem é HTML; só `&`, `<` e `>` mudam, para os comandos chegarem como foram escritos. */
function escapeText(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Shift+Enter grita; um comando digitado vale como foi escrito. */
function commandFor(html, shout) {
  return shout && !html.startsWith("/") ? `/shout ${html}` : html;
}

const chatBar = new ChatBar();

/** Liga a barra de conversa e o atalho (Enter) que leva o cursor até ela. Chamar uma vez no `init`. */
export function registerChatBar() {
  chatBar.activate();
  game.keybindings.register(MODULE_ID, "focusChatBar", {
    name: "TBG.Bar.focus",
    hint: "TBG.Bar.focusHint",
    editable: [{ key: "Enter" }],
    onDown: () => chatBar.focus(),
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
}
