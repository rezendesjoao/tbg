import { KINDS, MODULE_ID } from "../constants.mjs";
import { localize, stripParagraph } from "../utils.mjs";
import { narrate } from "./narrator.mjs";

const WHISPER_PATTERN = /^\/w(?:hisper)?\s/i;

const COMMANDS = {
  tbgSay: { rgx: /^\/(?:say|falar)\s([^]*)/i, fn: speakAs(KINDS.SAY) },
  tbgShout: { rgx: /^\/(?:shout|gritar)\s([^]*)/i, fn: speakAs(KINDS.SHOUT) },
  tbgThink: { rgx: /^\/(?:think|pensar)\s([^]*)/i, fn: think },
  tbgNarrate: { rgx: /^\/(?:n|narrar|narrate)\s([^]*)/i, fn: narrateCommand },
  tbgNarrateMarks: { rgx: /^=\s*([^=][^]*?)\s*=$/, fn: narrateCommand }
};

/** Fora do personagem: a mensagem inteira entre colchetes, ou terminada em `[]`. O `/ooc` do core vale do mesmo jeito. */
const OFF_PATTERN = /^\[([^[\]]*[^[\]\s][^[\]]*)\]$|^([^]*\S)\s*\[\]$/;

/**
 * Registra os comandos de fala, o fora do personagem entre colchetes e o `/ooc` com balão, a narração por `/n` e por
 * `= texto =`, o `/me` como ação inteira, o texto simples como fala e o falante em sussurros.
 */
export function registerChatCommands() {
  const { CHAT_COMMANDS } = foundry.applications.sidebar.tabs.ChatLog;
  Object.assign(CHAT_COMMANDS, COMMANDS);
  CHAT_COMMANDS.ooc = withBubbleToken(CHAT_COMMANDS.ooc);
  CHAT_COMMANDS.tbgOff = { rgx: OFF_PATTERN, fn: offCharacter };
  CHAT_COMMANDS.emote = asWholeAction(CHAT_COMMANDS.emote);
  Hooks.on("chatMessage", speakByDefault);
  Hooks.on("chatMessage", keepWhisperSpeaker);
  Hooks.on("preCreateChatMessage", restoreWhisperSpeaker);
}

/** Mantém o fora do personagem do core e só guarda o token para o balão, já que o core descarta o falante. */
function withBubbleToken(command) {
  return {
    ...command,
    fn(name, match, chatData, createOptions) {
      const { scene, token } = chatData.speaker ?? {};
      const result = command.fn.call(this, name, match, chatData, createOptions);
      setKind(chatData, KINDS.OOC);
      if (token) foundry.utils.setProperty(chatData, `flags.${MODULE_ID}.bubbleToken`, { scene, token });
      return result;
    }
  };
}

/** Passa pelo `/ooc` do core, com o token do balão, entregando a ele só o texto, sem os colchetes. */
function offCharacter(_command, match, chatData, createOptions) {
  const { ooc } = foundry.applications.sidebar.tabs.ChatLog.CHAT_COMMANDS;
  return ooc.fn.call(this, "ooc", [match[0], "", (match[1] ?? match[2]).trim()], chatData, createOptions);
}

/**
 * O `/me` do core vira uma ação inteira, como `*texto*`: a fala em negrito num balão comum. O core põe o nome no começo
 * do texto, e o balão já o mostra; fica o texto limpo que ele capturou.
 */
function asWholeAction(command) {
  return {
    ...command,
    fn(name, match, chatData, createOptions) {
      const result = command.fn.call(this, name, match, chatData, createOptions);
      chatData.content = `<strong>${withLineBreaks(match[2])}</strong>`;
      chatData.style = CONST.CHAT_MESSAGE_STYLES.IC;
      setKind(chatData, KINDS.SAY);
      return result;
    }
  };
}

function speakAs(kind) {
  return function speak(_command, match, chatData, createOptions) {
    chatData.content = withLineBreaks(match[1]);
    setKind(chatData, kind);
    if (hasSpeaker(chatData)) createOptions.messageMode = "ic";
    else speakOutOfCharacter(chatData);
  };
}

function think(_command, match, chatData) {
  if (!hasSpeaker(chatData)) throw new Error(localize("TBG.Errors.noSpeaker"));
  chatData.content = withLineBreaks(match[1]);
  chatData.style = CONST.CHAT_MESSAGE_STYLES.IC;
  chatData.whisper = thinkRecipients();
  setKind(chatData, KINDS.THINK);
}

function narrateCommand(_command, match) {
  narrate(withLineBreaks(match[1]));
  return false;
}

/**
 * Texto sem comando é sempre fala, qualquer que seja o modo de mensagem, que só escolhe a privacidade das rolagens:
 * com falante, em personagem; o jogador sem token, fora do personagem. O Mestre sem token nem chega aqui: o hook do
 * narrador, registrado antes, já o fez narrar.
 */
function speakByDefault(chatLog, message, chatData) {
  const [command] = chatLog.constructor.parse(message);
  if (command !== "none") return;
  const data = { ...chatData, content: withLineBreaks(stripParagraph(message)) };
  if (hasSpeaker(data)) {
    setKind(data, KINDS.SAY);
    ChatMessage.implementation.create(data, { messageMode: "ic" });
    return false;
  }
  data.speaker = { scene: data.speaker?.scene ?? game.user.viewedScene, actor: null, token: null, alias: "" };
  data.style = CONST.CHAT_MESSAGE_STYLES.OOC;
  setKind(data, KINDS.OOC);
  ChatMessage.implementation.create(data, { messageMode: "public" });
  return false;
}

function keepWhisperSpeaker(_chatLog, message, chatData) {
  if (!WHISPER_PATTERN.test(stripParagraph(message)) || !chatData.speaker?.token) return;
  foundry.utils.setProperty(chatData, `flags.${MODULE_ID}.speaker`, chatData.speaker);
}

function restoreWhisperSpeaker(message) {
  const speaker = message.getFlag(MODULE_ID, "speaker");
  if (!speaker || message.speaker.token) return;
  message.updateSource({ speaker, flags: { [MODULE_ID]: { kind: KINDS.WHISPER, speaker: null } } });
}

function speakOutOfCharacter(chatData) {
  chatData.style = CONST.CHAT_MESSAGE_STYLES.OOC;
  delete chatData.speaker;
}

function thinkRecipients() {
  const ids = new Set(ChatMessage.getWhisperRecipients("GM").map(user => user.id));
  ids.add(game.user.id);
  return [...ids];
}

function hasSpeaker(chatData) {
  return Boolean(chatData.speaker?.actor || chatData.speaker?.token);
}

function setKind(chatData, kind) {
  foundry.utils.setProperty(chatData, `flags.${MODULE_ID}.kind`, kind);
}

function withLineBreaks(text) {
  return text.replace(/\n/g, "<br>");
}
