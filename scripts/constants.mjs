export const MODULE_ID = "tbg";
export const MODULE_TITLE = "TBG";
export const LOG_PREFIX = "TBG |";
export const SOCKET_EVENT = `module.${MODULE_ID}`;

/** Tipos de mensagem do TBG, gravados em `flags.tbg.kind`. A ação inteira só vem de mensagens antigas e do estilo emote do core. */
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

export const SOCKET_TYPES = Object.freeze({
  PING: "ping",
  TYPING: "typing",
  TYPING_END: "typingEnd"
});

export const TEMPLATES = Object.freeze({
  bubble: `modules/${MODULE_ID}/templates/bubble.hbs`,
  chatBar: `modules/${MODULE_ID}/templates/chat-bar.hbs`,
  history: `modules/${MODULE_ID}/templates/history.hbs`,
  speakerWarning: `modules/${MODULE_ID}/templates/speaker-warning.hbs`
});

/** Evento interno disparado a cada mudança no campo da barra de conversa. */
export const INPUT_CHANGED = `${MODULE_ID}.chatInputChanged`;

/** Evento interno disparado quando o campo da barra de conversa perde o foco. */
export const INPUT_BLURRED = `${MODULE_ID}.chatInputBlurred`;

/** Evento interno disparado quando o Modo Narrador liga ou desliga. */
export const NARRATOR_CHANGED = `${MODULE_ID}.narratorChanged`;

/** Teto de caracteres de uma mensagem, igual para todas as mesas e todos os jogadores. */
export const CHAT_MAX_LENGTH = 130;
