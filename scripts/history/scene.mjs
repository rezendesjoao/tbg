import { MODULE_ID } from "../constants.mjs";
import { isTalk } from "../chat/kinds.mjs";

/** Cena em que a conversa aconteceu: a que o TBG grava ao criar, ou a do falante e a do token do balão, nas antigas. */
export function talkScene(message) {
  const recorded = message.getFlag(MODULE_ID, "scene") ?? message.speaker.scene;
  return recorded ?? message.getFlag(MODULE_ID, "bubbleToken")?.scene ?? null;
}

/** Conversa da cena que este cliente está vendo. */
export function isCurrentScene(message) {
  return talkScene(message) === (canvas.scene?.id ?? null);
}

/**
 * Grava a cena de cada conversa e a deixa fora das notificações do chat lateral, que só mostra rolagens.
 * Quando o Mestre ativa outra cena, a conversa das outras cenas é apagada: o histórico recomeça a cada cena.
 */
export function registerSceneTalk() {
  Hooks.on("preCreateChatMessage", markTalk);
  Hooks.on("updateScene", (scene, changed) => {
    if (changed.active === true) forgetOtherScenes(scene.id);
  });
}

/** As opções do `preCreateChatMessage` viajam para os outros clientes: `notify` desligado vale para todos. */
function markTalk(message, _data, options) {
  if (!isTalk(message)) return;
  options.notify = false;
  if (message.getFlag(MODULE_ID, "scene")) return;
  const scene = message.speaker.scene ?? message.getFlag(MODULE_ID, "bubbleToken")?.scene ?? game.user.viewedScene;
  message.updateSource({ flags: { [MODULE_ID]: { scene: scene ?? null } } });
}

/** Só o Mestre ativo apaga, uma vez por troca, para os clientes não brigarem pelas mesmas mensagens. */
async function forgetOtherScenes(sceneId) {
  if (!game.users.activeGM?.isSelf) return;
  const ids = game.messages.filter(message => isTalk(message) && talkScene(message) !== sceneId).map(message => message.id);
  if (ids.length) await ChatMessage.implementation.deleteDocuments(ids);
}
