import { MODULE_ID } from "../constants.mjs";
import { localize } from "../utils.mjs";
import { dataStrings, parseMarkup, usedItem } from "./usage-item.mjs";

const ID_PATTERN = /^[a-zA-Z0-9]{16}$/;
const USAGE_BURST_MS = 1500;
const BURST_LOOKBACK = 20;
const MAX_LABEL_LENGTH = 60;
const LABEL_TITLES = "h1, h2, h3, h4, strong";

/**
 * O que a ficha fez nesta mensagem, em qualquer sistema: o item do próprio falante ou o rótulo de uma rolagem.
 * Nunca o resultado. Null para fala, narração e rolagem sem rótulo.
 */
export function resolveUsage(message) {
  if (message.getFlag(MODULE_ID, "kind")) return null;
  const actor = ChatMessage.implementation.getSpeakerActor(message.speaker);
  if (!actor) return null;
  const item = usedItem(message, actor);
  if (item) return { actor, item, label: item.name, img: item.img, isRoll: false };
  const label = message.isRoll ? rollLabel(message) : null;
  return label ? { actor, item: null, label, img: null, isRoll: true } : null;
}

/**
 * Repetição de um uso já anunciado: a mensagem aponta para um uso anterior do mesmo ator (o ataque e o dano
 * ligados ao cartão), ou o mesmo uso saiu instantes antes. Sem estado: lê `game.messages`, então o F5 não repete.
 */
export function isRepeatedUsage(message, usage) {
  return isLinkedToUsage(message, usage) || isBurst(message, usage);
}

function rollLabel(message) {
  if (message.getFlag("core", "initiativeRoll")) return localize("TBG.Usage.initiative");
  const flavor = parseMarkup(message.flavor);
  const heading = flavor.querySelector(LABEL_TITLES)?.textContent.trim();
  const line = flavor.textContent.split("\n").map(text => text.trim()).find(Boolean);
  return shorten(heading || line || message.rolls[0]?.options.flavor?.trim() || "");
}

function shorten(text) {
  if (text.length <= MAX_LABEL_LENGTH) return text || null;
  return `${text.slice(0, MAX_LABEL_LENGTH - 1).trimEnd()}…`;
}

function isLinkedToUsage(message, usage) {
  return dataStrings(message).some(({ value }) => {
    if (!ID_PATTERN.test(value) || value === message.id) return false;
    const linked = game.messages.get(value);
    return Boolean(linked) && linked.timestamp <= message.timestamp && isSameUsage(linked, usage, { anyItem: true });
  });
}

function isBurst(message, usage) {
  const messages = game.messages.contents;
  const index = messages.lastIndexOf(message);
  if (index < 0) return false;
  for (const other of messages.slice(Math.max(0, index - BURST_LOOKBACK), index).reverse()) {
    if (message.timestamp - other.timestamp > USAGE_BURST_MS) return false;
    if (isSameUsage(other, usage, { anyItem: false })) return true;
  }
  return false;
}

/** Só conta um uso que este cliente viu; um cartão privado não cala a rolagem pública que o segue. */
function isSameUsage(other, usage, { anyItem }) {
  if (!other.isContentVisible) return false;
  const previous = resolveUsage(other);
  if (previous?.actor.uuid !== usage.actor.uuid) return false;
  return anyItem || (previous.item ? previous.item === usage.item : previous.label === usage.label);
}
