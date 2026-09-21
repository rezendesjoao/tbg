import { MODULE_ID } from "../constants.mjs";

/**
 * Token da cena atual que carrega o balão da mensagem, ou null.
 * Mensagens fora do personagem não guardam falante, então o token vem da flag gravada pelo comando.
 */
export function speakerToken(message) {
  const source = message.speaker.token ? message.speaker : message.getFlag(MODULE_ID, "bubbleToken");
  if (!canvas.ready || !source?.token || source.scene !== canvas.scene.id) return null;
  return canvas.tokens.get(source.token) ?? null;
}

/** O único token do ator na cena atual; com vários, nenhum, porque não há como saber qual agiu. */
export function actorToken(actor) {
  const tokens = actor.getActiveTokens();
  return tokens.length === 1 ? tokens[0] : null;
}

/** Imagem de quem fala: token, depois ator, depois avatar do usuário; fora do personagem, só o avatar. */
export function speakerImage(message) {
  if (message.style === CONST.CHAT_MESSAGE_STYLES.OOC) return message.author?.avatar ?? null;
  return speakerToken(message)?.document.texture.src ?? message.speakerActor?.img ?? message.author?.avatar ?? null;
}
