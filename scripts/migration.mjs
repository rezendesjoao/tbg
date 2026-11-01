import { SETTINGS, defaultSetting, getSetting, setSetting } from "./settings.mjs";
import { localize } from "./utils.mjs";

const VERSION = 1;
const OLD_RISE_SPEED = 35;
const CUSTOM_CHAT_TABS_ID = "custom-chat-tabs";

/** Leva uma vez, pela mão do Mestre ativo, os mundos de antes da barra de conversa para o jeito novo. */
export function registerMigration() {
  Hooks.once("ready", migrate);
}

async function migrate() {
  if (!game.users.activeGM?.isSelf || getSetting(SETTINGS.MIGRATION) >= VERSION) return;
  await setSetting(SETTINGS.MIGRATION, VERSION);
  await slowDownBubbles();
  await offerToDisableTabs();
}

/** O Foundry só usa o padrão de uma setting que o mundo nunca gravou: quem gravou o 35 antigo sobe devagar também. */
async function slowDownBubbles() {
  if (getSetting(SETTINGS.BUBBLE_RISE_SPEED) !== OLD_RISE_SPEED) return;
  await setSetting(SETTINGS.BUBBLE_RISE_SPEED, defaultSetting(SETTINGS.BUBBLE_RISE_SPEED));
}

/** Sem as abas ON, OFF e ROLL, as do Custom Chat Tabs só dividiriam um chat que já tem só rolagens. */
async function offerToDisableTabs() {
  if (!game.modules.get(CUSTOM_CHAT_TABS_ID)?.active || !game.settings.get(CUSTOM_CHAT_TABS_ID, "enable")) return;
  const accepted = await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("TBG.Migration.tabsTitle") },
    content: `<p>${localize("TBG.Migration.tabsContent")}</p>`,
    rejectClose: false
  });
  if (!accepted) return;
  await game.settings.set(CUSTOM_CHAT_TABS_ID, "enable", false);
  foundry.utils.debouncedReload();
}
