import { MODULE_ID } from "../constants.mjs";

const ID_PATTERN = /^[a-zA-Z0-9]{16}$/;
const SKIPPED_PATH = /target|delta|effect|modifier|consum|ammo|ammun|applied|update|created|deleted/i;
const SKIPPED_SCOPES = new Set(["core", MODULE_ID]);
const MAX_DEPTH = 6;
const MAX_STRINGS = 300;
const MARKUP_SELECTOR = "[data-item-uuid], [data-item-id], [data-uuid*='Item.']";
const CARD_TITLES = ".title, .item-name, .card-header h3";
const FLAVOR_TITLES = "h1, h2, h3, h4, strong";

/**
 * Item do próprio falante que a mensagem usou, ou null. Sem chave de sistema: varre os dados da mensagem,
 * depois os atributos do cartão, depois os títulos visíveis, e só aceita item que pertença ao ator que fala.
 */
export function usedItem(message, actor) {
  return itemFromData(message, actor) ?? itemFromMarkup(message, actor) ?? itemFromNames(message, actor);
}

/**
 * Ids e UUIDs em `system`, nas flags de outros pacotes e nas opções das rolagens, com o caminho de cada um.
 * Só esses contam para o teto: listas longas de texto, como as opções de rolagem do PF2e, não escondem a origem.
 */
export function dataStrings(message) {
  const { system, flags = {} } = message.toObject();
  const foreignFlags = Object.fromEntries(Object.entries(flags).filter(([scope]) => !SKIPPED_SCOPES.has(scope)));
  const found = [];
  for (const entry of strings({ system, flags: foreignFlags, rolls: message.rolls.map(roll => roll.options) })) {
    if (!ID_PATTERN.test(entry.value) && !entry.value.includes("Item.")) continue;
    found.push(entry);
    if (found.length >= MAX_STRINGS) break;
  }
  return found;
}

/** Documento inerte para ler o HTML da mensagem sem executar nada nem carregar imagens. */
export function parseMarkup(html) {
  return new DOMParser().parseFromString(html ?? "", "text/html").body;
}

function* strings(value, path = "", depth = 0) {
  if (depth > MAX_DEPTH || SKIPPED_PATH.test(path)) return;
  if (typeof value === "string") yield { path, value };
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) yield* strings(child, `${path}.${key}`, depth + 1);
}

function itemFromData(message, actor) {
  const rejected = new Set();
  const ranked = dataStrings(message).sort((a, b) => rank(a) - rank(b));
  for (const { value } of ranked) {
    const item = value.includes("Item.") ? itemFromUuid(value, actor, rejected) : itemFromId(value, actor, rejected);
    if (item) return item;
  }
  return null;
}

/** Caminhos com "item" primeiro, depois origem, depois fonte; em cada grupo, UUID antes de id solto, que é ambíguo. */
function rank({ path, value }) {
  const group = [/item/i, /origin/i, /source/i].findIndex(pattern => pattern.test(path));
  return (group < 0 ? 3 : group) * 2 + (value.includes("Item.") ? 0 : 1);
}

/**
 * UUID vale se o dono é o próprio ator ou o ator base de um token não vinculado. Um id recusado assim
 * não volta como id solto, senão o item do conjurador numa salvaguarda viraria item do alvo de mesmo ator base.
 */
function itemFromUuid(uuid, actor, rejected) {
  const parts = uuid.split(".");
  const index = parts.lastIndexOf("Item");
  const id = parts[index + 1];
  if (index < 1 || !ID_PATTERN.test(id ?? "")) return null;
  const owner = foundry.utils.fromUuidSync(parts.slice(0, index).join("."), { strict: false });
  if (isSameActor(owner, actor)) return actor.items.get(id) ?? null;
  rejected.add(id);
  return null;
}

function itemFromId(id, actor, rejected) {
  if (!ID_PATTERN.test(id ?? "") || rejected.has(id)) return null;
  return actor.items.get(id) ?? null;
}

function isSameActor(owner, actor) {
  return owner === actor || (actor.isToken && owner === game.actors.get(actor.id));
}

function itemFromMarkup(message, actor) {
  const rejected = new Set();
  const markup = parseMarkup(`${message.content}${message.flavor ?? ""}`);
  for (const element of markup.querySelectorAll(MARKUP_SELECTOR)) {
    if (element.closest("a.content-link")) continue;
    const { itemUuid, itemId, uuid } = element.dataset;
    const reference = itemUuid ?? uuid;
    const item = reference ? itemFromUuid(reference, actor, rejected) : itemFromId(itemId, actor, rejected);
    if (item) return item;
  }
  return null;
}

/** Fala digitada nunca sai no estilo OTHER com falante, então só aí o `strong` do conteúdo conta como título. */
function itemFromNames(message, actor) {
  const content = parseMarkup(message.content);
  const names = [titlePrefix(message.title), ...texts(content, CARD_TITLES), ...texts(parseMarkup(message.flavor), FLAVOR_TITLES)];
  if (message.style === CONST.CHAT_MESSAGE_STYLES.OTHER) names.push(...texts(content, "strong"));
  for (const name of names) {
    const item = name && actor.items.getName(name);
    if (item) return item;
  }
  return null;
}

/** Cartões costumam titular "Item - Atividade"; o nome do item pode ter " - ", por isso o último separador. */
function titlePrefix(title) {
  const index = title?.lastIndexOf(" - ") ?? -1;
  return index > 0 ? title.slice(0, index) : title || null;
}

function texts(root, selector) {
  return [...root.querySelectorAll(selector)].map(element => element.textContent.trim()).filter(Boolean);
}
