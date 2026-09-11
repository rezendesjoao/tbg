/** Token da cena atual que fala pela mensagem, ou null. */
export function speakerToken(message) {
  const { scene, token } = message.speaker;
  if (!canvas.ready || !token || scene !== canvas.scene.id) return null;
  return canvas.tokens.get(token) ?? null;
}

/** Imagem de quem fala: token, depois ator, depois avatar do usuário; fora do personagem, só o avatar. */
export function speakerImage(message) {
  if (message.style === CONST.CHAT_MESSAGE_STYLES.OOC) return message.author?.avatar ?? null;
  return speakerToken(message)?.document.texture.src ?? message.speakerActor?.img ?? message.author?.avatar ?? null;
}
