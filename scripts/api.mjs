import { KINDS, MODULE_ID } from "./constants.mjs";
import { SETTINGS, getSetting } from "./settings.mjs";
import { bubbleLayer } from "./bubbles/layer.mjs";
import { narrate, toggleNarrator } from "./chat/narrator.mjs";

/** Monta a API pública exposta em `game.modules.get("tbg").api`. */
export function createApi(module) {
  return {
    id: MODULE_ID,
    version: module.version,
    KINDS,
    isEnabled: () => getSetting(SETTINGS.ENABLED),
    say: (token, content, { kind = KINDS.SAY } = {}) => bubbleLayer.say({ token, content, kind }),
    narrate,
    toggleNarrator
  };
}
