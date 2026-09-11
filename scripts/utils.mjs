import { LOG_PREFIX } from "./constants.mjs";
import { SETTINGS, getSetting } from "./settings.mjs";

export function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

export function warn(...args) {
  console.warn(LOG_PREFIX, ...args);
}

/** Log detalhado, só com a setting de debug ligada. */
export function debug(...args) {
  if (getSetting(SETTINGS.DEBUG)) console.debug(LOG_PREFIX, ...args);
}

/** Traduz uma chave i18n, interpolando `data` quando informado. */
export function localize(key, data) {
  return data ? game.i18n.format(key, data) : game.i18n.localize(key);
}

/** Remove o parágrafo externo que o editor do chat adiciona, como o core faz em `ChatLog.parse`. */
export function stripParagraph(html) {
  return html.replace(/^<p>|<\/p>$/gi, "");
}
