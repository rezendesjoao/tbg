import { KINDS, MODULE_ID } from "../constants.mjs";
import { SETTINGS, getSetting } from "../settings.mjs";
import { localize, stripParagraph } from "../utils.mjs";
import { narrate } from "./narrator.mjs";

const WHISPER_PATTERN = /^\/w(?:hisper)?\s/i;

const COMMANDS = {
  tbgSay: { rgx: /^\/(?:say|falar)\s([^]*)/i, fn: speakAs(KINDS.SAY) },
  tbgShout: { rgx: /^\/(?:shout|gritar)\s([^]*)/i, fn: speakAs(KINDS.SHOUT) },
  tbgThink: { rgx: /^\/(?:think|pensar)\s([^]*)/i, fn: think },
  tbgAction: { rgx: /^\*([^*]+)\*$/, fn: act },
  tbgNarrate: { rgx: /^\/(?:n|narrar|narrate)\s([^]*)/i, fn: narrateCommand }
};

/** Registra os comandos de fala, o `/ooc` com balão e o tratamento do falante em sussurros. */
export function registerChatCommands() {
  const { CHAT_COMMANDS } = foundry.applications.sidebar.tabs.ChatLog;
  Object.assign(CHAT_COMMANDS, COMMANDS);
  CHAT_COMMANDS.ooc = withBubbleToken(CHAT_COMMANDS.ooc);
  Hooks.on("chatMessage", speakInCharacterByDefault);
  Hooks.on("chatMessage", keepWhisperSpeaker);
  Hooks.on("preCreateChatMessage", restoreWhisperSpeaker);
}

/** Mantém o `/ooc` do core e só guarda o token para o balão, já que o core descarta o falante. */
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

function act(_command, match, chatData) {
  const text = withLineBreaks(match[1]);
  setKind(chatData, KINDS.ACTION);
  if (!hasSpeaker(chatData)) {
    chatData.content = text;
    return speakOutOfCharacter(chatData);
  }
  chatData.style = CONST.CHAT_MESSAGE_STYLES.EMOTE;
  chatData.content = `${chatData.speaker.alias} ${text}`;
}

function narrateCommand(_command, match) {
  narrate(withLineBreaks(match[1]));
  return false;
}

function speakInCharacterByDefault(chatLog, message, chatData) {
  if (!getSetting(SETTINGS.AUTO_IN_CHARACTER) || !hasSpeaker(chatData)) return;
  if (game.settings.get("core", "messageMode") !== "public") return;
  const [command] = chatLog.constructor.parse(message);
  if (command !== "none") return;
  const content = withLineBreaks(stripParagraph(message));
  ChatMessage.implementation.create({ ...chatData, content }, { messageMode: "ic" });
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
