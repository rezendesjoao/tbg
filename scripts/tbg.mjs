import { MODULE_ID, MODULE_TITLE, TEMPLATES } from "./constants.mjs";
import { log } from "./utils.mjs";
import { registerSettings } from "./settings.mjs";
import { registerQueries, registerSocket } from "./sockets.mjs";
import { createApi } from "./api.mjs";
import { registerBubbles } from "./bubbles/layer.mjs";
import { registerBanners } from "./banners/layer.mjs";
import { registerChatCommands } from "./chat/commands.mjs";
import { registerChatInput } from "./chat/input.mjs";
import { registerCharacterCounter } from "./chat/counter.mjs";
import { registerTypingIndicator } from "./chat/typing.mjs";
import { registerNarrator } from "./chat/narrator.mjs";
import { registerChatRender } from "./chat/render.mjs";
import { registerChatTabs } from "./chat/tabs.mjs";
import { registerGuide } from "./guide/menu.mjs";

Hooks.once("init", () => {
  registerSettings();
  registerGuide();
  registerQueries();
  registerSocket();
  registerNarrator();
  registerChatCommands();
  registerChatInput();
  registerCharacterCounter();
  registerTypingIndicator();
  registerChatRender();
  registerChatTabs();
  registerBubbles();
  registerBanners();
  foundry.applications.handlebars.loadTemplates(Object.values(TEMPLATES));
  const module = game.modules.get(MODULE_ID);
  module.api = createApi(module);
});

Hooks.once("ready", () => {
  const module = game.modules.get(MODULE_ID);
  log(`${MODULE_TITLE} ${module.version} pronto | Foundry ${game.version} | ${game.system.id} ${game.system.version}`);
  Hooks.callAll("tbg.ready", module.api);
});
