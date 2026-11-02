import { TEMPLATES } from "../constants.mjs";
import { localize } from "../utils.mjs";
import { isNarrating } from "./narrator.mjs";

/** Comandos que falam pelo token selecionado; rolagens, narração e fora do personagem não falam por ele. */
const SPEECH_COMMANDS = new Set(["none", "tbgSay", "tbgShout", "tbgThink", "ic", "emote", "whisper"]);

/** Personagens pelos quais o Mestre já disse que vai falar, por uuid do ator, até recarregar a página. */
const allowed = new Set();

/**
 * O Mestre quase nunca fala pelo personagem de um jogador: antes de mandar uma fala por ele, pergunta.
 * Devolve se a mensagem pode sair.
 */
export async function confirmSpeaker(message) {
  if (!game.user.isGM) return true;
  const speaker = ChatMessage.implementation.getSpeaker();
  const [command] = ui.chat.constructor.parse(message);
  if (!SPEECH_COMMANDS.has(command) || (command === "none" && isNarrating(speaker))) return true;
  const actor = canvas.tokens?.get(speaker.token)?.actor ?? game.actors.get(speaker.actor) ?? null;
  const players = actor ? playersOf(actor) : [];
  if (!players.length || allowed.has(actor.uuid)) return true;
  const answer = await ask(actor, players);
  if (!answer || typeof answer !== "object") return false;
  if (answer.remember) allowed.add(actor.uuid);
  return true;
}

/** Jogadores donos do personagem ou que o têm como personagem atribuído. */
function playersOf(actor) {
  return game.users.filter(user => !user.isGM && (user.character?.id === actor.id || actor.testUserPermission(user, "OWNER")));
}

/** Cancelar é o padrão: um Enter distraído não manda a fala. */
async function ask(actor, players) {
  const content = await foundry.applications.handlebars.renderTemplate(TEMPLATES.speakerWarning, {
    name: actor.name,
    players: players.map(user => user.name).join(", ")
  });
  return foundry.applications.api.DialogV2.wait({
    window: { title: "TBG.Guard.title", icon: "fa-solid fa-user-shield" },
    content,
    buttons: [
      {
        action: "speak",
        label: localize("TBG.Guard.speak", { name: actor.name }),
        icon: "fa-solid fa-comment",
        callback: (_event, button) => ({ remember: button.form.elements.remember.checked })
      },
      { action: "cancel", label: "TBG.Guard.cancel", icon: "fa-solid fa-xmark", default: true }
    ],
    rejectClose: false
  });
}
