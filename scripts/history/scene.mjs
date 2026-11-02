import { MODULE_ID } from "../constants.mjs";
import { isTalk } from "../chat/kinds.mjs";

const CLOCK_SLACK_MS = 5000;

/** Cena em que a conversa aconteceu: a que o TBG grava ao criar, ou a do falante e a do token do balão, nas antigas. */
export function talkScene(message) {
  const recorded = message.getFlag(MODULE_ID, "scene") ?? message.speaker.scene;
  return recorded ?? message.getFlag(MODULE_ID, "bubbleToken")?.scene ?? null;
}

/** Conversa da cena que este cliente está vendo. */
export function isCurrentScene(message) {
  return talkScene(message) === (canvas.scene?.id ?? null);
}

/** Hora em que o Mestre ativou a cena pela última vez: o histórico dos jogadores começa aí. */
export function talkSince(scene) {
  return scene?.getFlag(MODULE_ID, "talkSince") ?? 0;
}

/**
 * Grava a cena de cada conversa e a deixa fora das notificações do chat lateral. Nada é apagado: ao ser ativada,
 * a cena guarda a hora, e o histórico dos jogadores recomeça dali; o do Mestre continua com tudo.
 */
export function registerSceneTalk() {
  Hooks.on("preCreateChatMessage", markTalk);
  Hooks.on("updateScene", (scene, changed) => {
    if (changed.active === true) markActivation(scene);
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

/**
 * Só o Mestre ativo grava. Cada mensagem leva a hora do relógio de quem a criou, e a marca, a do relógio do Mestre:
 * a folga cobre a diferença entre os relógios. O `game.time.serverTime` do v14 conta desde que o servidor subiu.
 */
function markActivation(scene) {
  if (!game.users.activeGM?.isSelf) return;
  scene.setFlag(MODULE_ID, "talkSince", Date.now() - CLOCK_SLACK_MS);
}
