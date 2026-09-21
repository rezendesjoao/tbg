import { CHAT_MAX_LENGTH, INPUT_BLURRED, INPUT_CHANGED } from "../constants.mjs";
import { stripParagraph } from "../utils.mjs";

/**
 * Plugin ProseMirror do editor do chat: Shift+Enter grita, o limite de caracteres é aplicado
 * e cada mudança ou perda de foco é anunciada para o contador e o indicador de digitação.
 */
export function registerChatInput() {
  Hooks.on("createProseMirrorEditor", prependPlugin);
}

function prependPlugin(_uuid, plugins) {
  if (!isChatInput(plugins)) return;
  const registered = Object.entries(plugins);
  for (const key of Object.keys(plugins)) delete plugins[key];
  Object.assign(plugins, { tbgInput: build() }, Object.fromEntries(registered));
}

/** O core reserva a chave `chatInput` em todo editor; só o do chat recebe o `ChatInputPlugin` de verdade. */
function isChatInput(plugins) {
  return plugins.chatInput?.spec?.instance instanceof foundry.prosemirror.plugins.chat.ChatInputPlugin;
}

function build() {
  return new foundry.prosemirror.state.Plugin({
    props: { handleKeyDown: onKeyDown, handleDOMEvents: { blur: onBlur } },
    filterTransaction: withinLimit,
    view: () => ({ update: announce })
  });
}

function lengthOf(doc) {
  return doc.textBetween(0, doc.content.size, "\n").length;
}

/** Encurtar é sempre permitido, senão um texto já acima do limite trancaria o editor, sem apagar nem recuar no histórico. */
function withinLimit(transaction, state) {
  if (!transaction.docChanged) return true;
  const next = lengthOf(transaction.doc);
  return next <= CHAT_MAX_LENGTH || next < lengthOf(state.doc);
}

function announce(view, previous) {
  const length = lengthOf(view.state.doc);
  if (length === lengthOf(previous.doc)) return;
  Hooks.callAll(INPUT_CHANGED, length);
}

/** Devolve `false` para o ProseMirror também tratar o blur, senão o editor ficaria marcado como focado. */
function onBlur() {
  Hooks.callAll(INPUT_BLURRED);
  return false;
}

function onKeyDown(view, event) {
  if (event.key !== "Enter" || !event.shiftKey || event.isComposing) return false;
  const html = stripParagraph(foundry.prosemirror.dom.serializeString(view.state.doc.content));
  if (html) send(view, html.startsWith("/") ? html : `/shout ${html}`);
  return true;
}

async function send(view, message) {
  try {
    await ui.chat.processMessage(message);
    clear(view);
  } catch (error) {
    Hooks.onError("ChatLog#processMessage", error, { notify: "error", log: "error", message });
  }
}

function clear(view) {
  const { state } = view;
  view.dispatch(state.tr.replaceWith(0, state.doc.content.size, foundry.prosemirror.dom.parseString("").content));
}
