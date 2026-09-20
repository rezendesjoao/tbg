export const MODULE_ID = "tbg";
export const MODULE_TITLE = "TBG";
export const LOG_PREFIX = "TBG |";
export const SOCKET_EVENT = `module.${MODULE_ID}`;

/** Tipos de mensagem do TBG, gravados em `flags.tbg.kind`. */
export const KINDS = Object.freeze({
  SAY: "say",
  SHOUT: "shout",
  WHISPER: "whisper",
  THINK: "think",
  ACTION: "action",
  NARRATION: "narration",
  OOC: "ooc"
});

/** Tipos que viram balão sobre o token. */
export const BUBBLE_KINDS = new Set([KINDS.SAY, KINDS.SHOUT, KINDS.WHISPER, KINDS.THINK, KINDS.ACTION, KINDS.OOC]);

/** Tipos sem cabeçalho no balão: a ação se lê como narração curta, e o balão já sai do token. */
export const ANONYMOUS_KINDS = new Set([KINDS.ACTION]);

export const SOCKET_TYPES = Object.freeze({
  PING: "ping",
  TYPING: "typing",
  TYPING_END: "typingEnd"
});

export const TEMPLATES = Object.freeze({
  bubble: `modules/${MODULE_ID}/templates/bubble.hbs`,
  typing: `modules/${MODULE_ID}/templates/typing.hbs`
});

/** Evento interno disparado a cada mudança no editor do chat. */
export const INPUT_CHANGED = `${MODULE_ID}.chatInputChanged`;

/** Teto de caracteres de uma mensagem, igual para todas as mesas e todos os jogadores. */
export const CHAT_MAX_LENGTH = 150;
