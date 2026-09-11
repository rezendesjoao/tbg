import { MODULE_ID, SOCKET_EVENT, SOCKET_TYPES } from "./constants.mjs";
import { debug, warn } from "./utils.mjs";

/**
 * Camada de socket do TBG.
 *
 * Regras:
 * - Só coisas efêmeras passam por aqui (digitando…, foco, etc.). Tudo que
 *   precisa persistir vai em `flags` de documentos, que o Foundry sincroniza.
 * - O cliente que emite NÃO recebe o próprio pacote; por isso cada pacote
 *   carrega `userId` para o destinatário saber quem falou.
 * - Pedido/resposta direcionado usa `CONFIG.queries` (nativo, v13+), não socket.
 */

/** @type {Map<string, (payload: object, userId: string) => void>} */
const handlers = new Map();

/**
 * Registra um handler para um tipo de pacote.
 * @param {string} type    Um dos SOCKET_TYPES
 * @param {(payload: object, userId: string) => void} handler
 */
export function onSocket(type, handler) {
  handlers.set(type, handler);
}

/**
 * Emite um pacote para todos os outros clientes conectados.
 * @param {string} type    Um dos SOCKET_TYPES
 * @param {object} [payload] Precisa ser serializável em JSON (envie ids/uuids, não documentos)
 */
export function emit(type, payload = {}) {
  game.socket.emit(SOCKET_EVENT, { type, payload, userId: game.user.id });
}

/** Liga o listener do socket. Chamado uma vez no hook `init`. */
export function registerSocket() {
  game.socket.on(SOCKET_EVENT, packet => {
    if (!packet || typeof packet !== "object") return;
    const { type, payload = {}, userId } = packet;
    const handler = handlers.get(type);
    if (!handler) {
      debug(`pacote de socket sem handler: ${type}`);
      return;
    }
    try {
      handler(payload, userId);
    } catch (err) {
      warn(`erro no handler de socket "${type}"`, err);
    }
  });

  onSocket(SOCKET_TYPES.PING, (payload, userId) => {
    const user = game.users.get(userId);
    debug(`ping recebido de ${user?.name ?? userId}`, payload);
  });
}

/**
 * Registra queries (pedido/resposta direcionado, `user.query("tbg.x", data)`).
 * Nomes precisam ser prefixados com o id do módulo. Chamado no hook `init`.
 */
export function registerQueries() {
  CONFIG.queries[`${MODULE_ID}.ping`] = async data => ({
    ok: true,
    user: game.user.name,
    version: game.modules.get(MODULE_ID)?.version,
    echo: data ?? null
  });
}
