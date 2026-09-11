import { MODULE_ID, SOCKET_EVENT, SOCKET_TYPES } from "./constants.mjs";
import { debug, warn } from "./utils.mjs";

const handlers = new Map();

/** Registra o handler de um tipo de pacote. */
export function onSocket(type, handler) {
  handlers.set(type, handler);
}

/** Envia um pacote aos outros clientes; `payload` precisa ser serializável em JSON. */
export function emit(type, payload = {}) {
  game.socket.emit(SOCKET_EVENT, { type, payload, userId: game.user.id });
}

/** Liga o listener do socket. Chamar uma vez no `init`. */
export function registerSocket() {
  game.socket.on(SOCKET_EVENT, dispatch);
  onSocket(SOCKET_TYPES.PING, (payload, userId) => debug("ping de", game.users.get(userId)?.name, payload));
}

/** Registra as queries de pedido e resposta (`user.query("tbg.ping")`). */
export function registerQueries() {
  CONFIG.queries[`${MODULE_ID}.ping`] = async data => ({ ok: true, user: game.user.name, echo: data ?? null });
}

function dispatch({ type, payload = {}, userId } = {}) {
  const handler = handlers.get(type);
  if (!handler) return debug(`pacote sem handler: ${type}`);
  try {
    handler(payload, userId);
  } catch (error) {
    warn(`handler de socket "${type}" falhou`, error);
  }
}
