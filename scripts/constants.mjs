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

/** Variante do balão de uso da ficha; derivada da mensagem, nunca gravada em flag. */
export const USAGE_KIND = "usage";

/** Tipos sem cabeçalho no balão: a ação se lê como narração curta, e o uso já traz o nome no texto. */
export const ANONYMOUS_KINDS = new Set([KINDS.ACTION, USAGE_KIND]);

export const SOCKET_TYPES = Object.freeze({
  PING: "ping",
  TYPING: "typing",
  TYPING_END: "typingEnd"
});

export const TEMPLATES = Object.freeze({
  bubble: `modules/${MODULE_ID}/templates/bubble.hbs`,
  banner: `modules/${MODULE_ID}/templates/banner.hbs`
});

/** Evento interno disparado a cada mudança no editor do chat. */
export const INPUT_CHANGED = `${MODULE_ID}.chatInputChanged`;

/** Evento interno disparado quando o editor do chat perde o foco. */
export const INPUT_BLURRED = `${MODULE_ID}.chatInputBlurred`;

/** Teto de caracteres de uma mensagem, igual para todas as mesas e todos os jogadores. */
export const CHAT_MAX_LENGTH = 150;
