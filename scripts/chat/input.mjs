import { INPUT_CHANGED } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { stripParagraph } from "../utils.mjs";

/**
 * Plugin ProseMirror do editor do chat: Shift+Enter grita, o limite de caracteres é aplicado
 * e cada mudança é anunciada para o contador e o indicador de digitação.
 */
export function registerChatInput() {
  Hooks.on("createProseMirrorEditor", prependPlugin);
}

function prependPlugin(_uuid, plugins) {
  if (!plugins.chatInput) return;
  const registered = Object.entries(plugins);
  for (const key of Object.keys(plugins)) delete plugins[key];
  Object.assign(plugins, { tbgInput: build() }, Object.fromEntries(registered));
}

function build() {
  return new foundry.prosemirror.state.Plugin({
    props: { handleKeyDown: onKeyDown },
    filterTransaction: withinLimit,
    view: () => ({ update: announce })
  });
}

function lengthOf(doc) {
  return doc.textBetween(0, doc.content.size, "\n").length;
}

function withinLimit(transaction) {
  const max = getSetting(SETTINGS.CHAT_MAX_LENGTH);
  if (!max || !transaction.docChanged) return true;
  return lengthOf(transaction.doc) <= max;
}

function announce(view, previous) {
  const length = lengthOf(view.state.doc);
  if (length === lengthOf(previous.doc)) return;
  Hooks.callAll(INPUT_CHANGED, length);
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
