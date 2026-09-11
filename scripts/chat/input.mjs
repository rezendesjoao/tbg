import { stripParagraph } from "../utils.mjs";

/** Faz Shift+Enter enviar a mensagem como grito, com um plugin ProseMirror à frente dos do core no editor do chat. */
export function registerChatInput() {
  Hooks.on("createProseMirrorEditor", prependInputPlugin);
}

function prependInputPlugin(_uuid, plugins) {
  if (!plugins.chatInput) return;
  const entries = Object.entries(plugins);
  for (const key of Object.keys(plugins)) delete plugins[key];
  Object.assign(plugins, { tbgInput: buildPlugin() }, Object.fromEntries(entries));
}

function buildPlugin() {
  return new foundry.prosemirror.state.Plugin({ props: { handleKeyDown: onKeyDown } });
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
