import { MODULE_ID } from "./constants.mjs";

/** Chaves das settings, para ninguém digitar string solta pelo código. */
export const SETTINGS = Object.freeze({
  ENABLED: "enabled",
  DEBUG: "debug"
});

/**
 * Registra as settings do módulo. Chamado uma vez no hook `init`.
 * As fases seguintes adicionam aqui as opções do motor de balões (velocidade,
 * largura, faixa), do Modo Narrador (nome do narrador) e do tema do chat.
 */
export function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.ENABLED, {
    name: "TBG.Settings.Enabled.Name",
    hint: "TBG.Settings.Enabled.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: false,
    onChange: value => Hooks.callAll("tbg.enabledChanged", value)
  });

  game.settings.register(MODULE_ID, SETTINGS.DEBUG, {
    name: "TBG.Settings.Debug.Name",
    hint: "TBG.Settings.Debug.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false
  });
}

/**
 * Lê uma setting do módulo.
 * @param {string} key Uma das chaves em SETTINGS
 */
export function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}

/**
 * Grava uma setting do módulo.
 * @param {string} key Uma das chaves em SETTINGS
 * @param {*} value
 */
export function setSetting(key, value) {
  return game.settings.set(MODULE_ID, key, value);
}
