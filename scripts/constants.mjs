/**
 * Constantes compartilhadas do TBG.
 * Tudo que outros arquivos precisam referenciar por nome fica aqui, para que
 * trocar o id do módulo ou o prefixo de log seja uma mudança em um único lugar.
 */

/** Id do módulo. Precisa ser igual ao nome da pasta e ao `id` em module.json. */
export const MODULE_ID = "tbg";

/** Título legível, usado em logs e mensagens de interface. */
export const MODULE_TITLE = "TBG";

/** Prefixo de todas as linhas de console do módulo. */
export const LOG_PREFIX = "TBG |";

/**
 * Nome do evento de socket do módulo. O Foundry exige o formato `module.<id>`
 * e que `"socket": true` esteja no manifesto.
 */
export const SOCKET_EVENT = `module.${MODULE_ID}`;

/** Escopo usado em `document.setFlag(FLAG_SCOPE, ...)`. */
export const FLAG_SCOPE = MODULE_ID;

/**
 * Tipos de mensagem que o TBG reconhece. Gravados em `flags.tbg.kind` de cada
 * ChatMessage para que balões, tema do chat e abas saibam como tratar a mensagem.
 * Cada um corresponde a um modo de fala do briefing (A3, B1, B4).
 */
export const KINDS = Object.freeze({
  SAY: "say",
  SHOUT: "shout",
  WHISPER: "whisper",
  THINK: "think",
  ACTION: "action",
  NARRATION: "narration",
  ANNOUNCE: "announce",
  OOC: "ooc"
});

/** Tipos de pacote trafegados pelo socket (efêmeros; nada persistente passa por aqui). */
export const SOCKET_TYPES = Object.freeze({
  PING: "ping",
  TYPING: "typing",
  TYPING_END: "typingEnd"
});
