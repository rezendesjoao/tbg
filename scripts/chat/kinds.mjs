import { KINDS, MODULE_ID } from "../constants.mjs";

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

function kindsByStyle() {
  const { IC, EMOTE, OOC } = CONST.CHAT_MESSAGE_STYLES;
  return { [IC]: KINDS.SAY, [EMOTE]: KINDS.ACTION, [OOC]: KINDS.OOC };
}
