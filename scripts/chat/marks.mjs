import { isTalk } from "./kinds.mjs";

/**
 * Ação no meio da fala: o trecho entre asteriscos (um ou dois) ou entre aspas simples. A marca abre no começo ou
 * depois de algo que não é letra nem número e fecha antes do mesmo, então o apóstrofo de "d'água" e a conta "2*3"
 * ficam como estão.
 */
const ACTION_MARK = /(?<![\p{L}\p{N}*])(\*\*|\*|')(?![\s*])(.+?)(?<![\s*])\1(?![\p{L}\p{N}*])/u;

/** As marcas de ação viram negrito em toda conversa, qualquer que seja o comando: fala, grito, sussurro, narração. */
export function registerActionMarks() {
  Hooks.on("preCreateChatMessage", message => {
    if (!message.content || !isTalk(message)) return;
    const content = markActions(message.content);
    if (content !== message.content) message.updateSource({ content });
  });
}

/** Troca cada ação por um `<strong>` com o texto dela, sem as marcas; só nos textos, nunca em tags nem atributos. */
function markActions(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  const changed = texts.filter(text => ACTION_MARK.test(text.data));
  for (const text of changed) text.replaceWith(...actionNodes(text.data));
  return changed.length ? template.innerHTML : html;
}

/** O `split` com grupos devolve, a cada ação, o texto antes, a marca e o que estava entre as marcas. */
function actionNodes(data) {
  return data.split(ACTION_MARK).flatMap((part, index) => {
    if (index % 3 === 1 || !part) return [];
    if (index % 3 === 0) return [part];
    const strong = document.createElement("strong");
    strong.textContent = part;
    return [strong];
  });
}
