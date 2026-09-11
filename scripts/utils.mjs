import { LOG_PREFIX, MODULE_ID } from "./constants.mjs";

/** Log normal, sempre visível. */
export function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

/** Aviso, sempre visível. */
export function warn(...args) {
  console.warn(LOG_PREFIX, ...args);
}

/** Erro, sempre visível. */
export function error(...args) {
  console.error(LOG_PREFIX, ...args);
}

/**
 * Log detalhado, só quando a setting de cliente `debug` está ligada.
 * Protegido contra chamadas antes das settings serem registradas.
 */
export function debug(...args) {
  let enabled = false;
  try {
    enabled = game.settings.get(MODULE_ID, "debug");
  } catch {
    enabled = false;
  }
  if (enabled) console.debug(LOG_PREFIX, ...args);
}

/**
 * Atalho de tradução. Com `data`, usa `format` (substitui `{chaves}`);
 * sem `data`, usa `localize`.
 * @param {string} key   Chave i18n, ex.: "TBG.Settings.Enabled.Name"
 * @param {object} [data] Valores para interpolação
 * @returns {string}
 */
export function t(key, data) {
  return data ? game.i18n.format(key, data) : game.i18n.localize(key);
}
