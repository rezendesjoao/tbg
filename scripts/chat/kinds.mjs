import { KINDS, MODULE_ID } from "../constants.mjs";

/** Tipo TBG de uma mensagem: a flag vence; sem flag, deriva do sussurro ou do estilo do core. */
export function resolveKind(message) {
  const flagged = message.getFlag(MODULE_ID, "kind");
  if (flagged) return flagged;
  if (message.whisper.length) return KINDS.WHISPER;
  return kindsByStyle()[message.style] ?? null;
}

function kindsByStyle() {
  const { IC, EMOTE, OOC } = CONST.CHAT_MESSAGE_STYLES;
  return { [IC]: KINDS.SAY, [EMOTE]: KINDS.ACTION, [OOC]: KINDS.OOC };
}
