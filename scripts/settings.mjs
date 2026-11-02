import { MODULE_ID } from "./constants.mjs";

export const SETTINGS = Object.freeze({
  ENABLED: "enabled",
  DEBUG: "debug",
  BUBBLE_LAYOUT: "bubbleLayout",
  BUBBLE_RISE_SPEED: "bubbleRiseSpeed",
  BUBBLE_BAND_HEIGHT: "bubbleBandHeight",
  BUBBLE_MAX_LIFETIME: "bubbleMaxLifetime",
  BUBBLE_PORTRAIT: "bubblePortrait",
  TYPING_INDICATOR: "typingIndicator",
  USAGE_BUBBLES: "usageBubbles",
  NARRATION_BANNER: "narrationBanner",
  NARRATOR_NAME: "narratorName",
  NARRATOR_ACTIVE: "narratorActive",
  CHAT_THEME: "chatTheme",
  MIGRATION: "migration"
});

export const BUBBLE_LAYOUTS = Object.freeze({ FREE_FLOW: "freeflow", LINE: "line" });

const DEFINITIONS = {
  [SETTINGS.ENABLED]: {
    scope: "world",
    type: Boolean,
    default: true,
    onChange: enabled => Hooks.callAll("tbg.enabledChanged", enabled)
  },
  [SETTINGS.DEBUG]: { scope: "client", type: Boolean, default: false },
  [SETTINGS.BUBBLE_LAYOUT]: {
    scope: "world",
    type: String,
    default: BUBBLE_LAYOUTS.FREE_FLOW,
    choices: choicesFor(SETTINGS.BUBBLE_LAYOUT, BUBBLE_LAYOUTS)
  },
  [SETTINGS.BUBBLE_RISE_SPEED]: { scope: "world", type: Number, default: 15, range: { min: 0, max: 120, step: 5 } },
  [SETTINGS.BUBBLE_BAND_HEIGHT]: { scope: "world", type: Number, default: 200, range: { min: 60, max: 600, step: 10 } },
  [SETTINGS.BUBBLE_MAX_LIFETIME]: { scope: "world", type: Number, default: 0, range: { min: 0, max: 300, step: 5 } },
  [SETTINGS.BUBBLE_PORTRAIT]: { scope: "world", type: Boolean, default: true },
  [SETTINGS.TYPING_INDICATOR]: { scope: "world", type: Boolean, default: true },
  [SETTINGS.USAGE_BUBBLES]: { scope: "world", type: Boolean, default: true },
  [SETTINGS.NARRATION_BANNER]: { scope: "world", type: Boolean, default: true },
  [SETTINGS.NARRATOR_NAME]: { scope: "world", type: String, default: "" },
  [SETTINGS.NARRATOR_ACTIVE]: { scope: "client", type: Boolean, default: false, config: false },
  [SETTINGS.CHAT_THEME]: { scope: "client", type: Boolean, default: true },
  [SETTINGS.MIGRATION]: { scope: "world", type: Number, default: 0, config: false }
};

/** Registra todas as settings da tabela. Chamar uma vez no `init`. */
export function registerSettings() {
  for (const [key, definition] of Object.entries(DEFINITIONS)) {
    game.settings.register(MODULE_ID, key, {
      name: `TBG.Settings.${key}.name`,
      hint: `TBG.Settings.${key}.hint`,
      config: true,
      ...definition
    });
  }
}

export function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}

export function setSetting(key, value) {
  return game.settings.set(MODULE_ID, key, value);
}

/** Valor padrão registrado de uma setting, para migrar mundos que gravaram o padrão antigo. */
export function defaultSetting(key) {
  return DEFINITIONS[key].default;
}

function choicesFor(key, values) {
  return Object.fromEntries(Object.values(values).map(value => [value, `TBG.Settings.${key}.choices.${value}`]));
}
