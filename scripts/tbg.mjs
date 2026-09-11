/**
 * TBG — ponto de entrada.
 *
 * Ordem dos hooks do Foundry: init → i18nInit → setup → ready.
 * - `init`: registrar settings, queries, socket e a API pública.
 * - `ready`: tudo carregado (canvas, usuários, cena); anunciar que o módulo está pronto.
 *
 * As fases do briefing (docs/BRIEFING.md) plugam seus módulos aqui:
 *   bubbles/engine.mjs (A1), chat/commands.mjs (A3, B4), chat/narrator.mjs (B1),
 *   chat/render.mjs (C1), chat/typing.mjs (A5), ...
 */

import { MODULE_ID, MODULE_TITLE, KINDS, SOCKET_TYPES } from "./constants.mjs";
import { log } from "./utils.mjs";
import { registerSettings, getSetting, SETTINGS } from "./settings.mjs";
import { registerSocket, registerQueries, emit, onSocket } from "./sockets.mjs";

Hooks.once("init", () => {
  const mod = game.modules.get(MODULE_ID);
  log(`${MODULE_TITLE} v${mod.version} | init | Foundry ${game.version}`);

  registerSettings();
  registerQueries();
  registerSocket();

  /**
   * API pública: `game.modules.get("tbg").api`.
   * Outros módulos e macros usam isto; as fases seguintes acrescentam
   * `say(token, text, opts)`, `narrate(text)`, etc.
   */
  mod.api = {
    id: MODULE_ID,
    version: mod.version,
    KINDS,
    isEnabled: () => getSetting(SETTINGS.ENABLED),
    socket: { emit, on: onSocket, TYPES: SOCKET_TYPES }
  };
});

Hooks.once("ready", () => {
  const mod = game.modules.get(MODULE_ID);
  log(
    `ready | enabled=${getSetting(SETTINGS.ENABLED)} | sistema=${game.system.id} ${game.system.version} | usuário=${game.user.name}${game.user.isGM ? " (GM)" : ""}`
  );
  Hooks.callAll("tbg.ready", mod.api);
});
