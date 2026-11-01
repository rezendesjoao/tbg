import { isTalk } from "./kinds.mjs";

/**
 * O chat lateral fica só com rolagens e cartões: a conversa vai para os balões e para o histórico da cena, e se
 * digita na barra de conversa. O CSS esconde o campo do chat e as mensagens marcadas aqui; os modos de mensagem
 * continuam, porque escolhem a privacidade das rolagens.
 */
export function registerChatLog() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (isTalk(message)) html.classList.add("tbg-talk");
  });
}
