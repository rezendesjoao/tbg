import { KINDS, MODULE_ID } from "../constants.mjs";

const CARD_MARKUP = /<(div|section|header|footer|table|form|button|figure)\b/i;

/** Tipo TBG de uma mensagem: a flag vence; sem flag, deriva do sussurro ou do estilo do core. */
export function resolveKind(message) {
  const flagged = message.getFlag(MODULE_ID, "kind");
  if (flagged) return flagged;
  if (message.whisper.length) return KINDS.WHISPER;
  return kindsByStyle()[message.style] ?? null;
}

/**
 * Mensagem que alguém falou, e não cartão de sistema: comando do TBG, ou tipo base em personagem, sem rolagem.
 * Sem esse filtro, um cartão sussurrado ou criado no modo em personagem viraria balão com o HTML dele.
 */
export function isSpeech(message) {
  if (message.isRoll) return false;
  if (message.getFlag(MODULE_ID, "kind")) return true;
  const { IC, EMOTE } = CONST.CHAT_MESSAGE_STYLES;
  return message.type === CONST.BASE_DOCUMENT_TYPE && [IC, EMOTE].includes(message.style);
}

/**
 * Conversa, que vai para os balões e o histórico da cena: fala, narração e o que se digitou fora do personagem.
 * O resto, rolagens e cartões, fica no chat lateral. Sussurro digitado sem personagem chega sem falante; cartão de
 * sistema sussurrado ao Mestre também, mas traz marcação de cartão.
 */
export function isTalk(message) {
  if (isSpeech(message)) return true;
  if (message.isRoll) return false;
  if (message.style === CONST.CHAT_MESSAGE_STYLES.OOC) return true;
  const { actor, token } = message.speaker;
  return message.whisper.length > 0 && !actor && !token && !CARD_MARKUP.test(message.content ?? "");
}

/** Comando do Mestre sem token nem personagem (`*ação*`, `/shout`, `/w`): o balão sai sem nome. O texto simples vira narração. */
export function isMasterVoice(message) {
  if (!message.author?.isGM || resolveKind(message) === KINDS.NARRATION) return false;
  const { actor, token } = message.speaker;
  return !actor && !token && !message.getFlag(MODULE_ID, "bubbleToken");
}

function kindsByStyle() {
  const { IC, EMOTE, OOC } = CONST.CHAT_MESSAGE_STYLES;
  return { [IC]: KINDS.SAY, [EMOTE]: KINDS.ACTION, [OOC]: KINDS.OOC };
}
