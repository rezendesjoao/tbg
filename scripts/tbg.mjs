import { MODULE_ID, MODULE_TITLE, TEMPLATES } from "./constants.mjs";
import { log } from "./utils.mjs";
import { registerSettings } from "./settings.mjs";
import { registerQueries, registerSocket } from "./sockets.mjs";
import { createApi } from "./api.mjs";
import { registerBubbles } from "./bubbles/layer.mjs";
import { registerChatCommands } from "./chat/commands.mjs";
import { registerActionMarks } from "./chat/marks.mjs";
import { registerChatBar } from "./chat/bar.mjs";
import { registerTypingIndicator } from "./chat/typing.mjs";
import { registerNarrator } from "./chat/narrator.mjs";
import { registerChatRender } from "./chat/render.mjs";
import { registerChatLog } from "./chat/log.mjs";
import { registerSceneTalk } from "./history/scene.mjs";
import { registerHistory } from "./history/window.mjs";
import { registerGuide } from "./guide/menu.mjs";
import { registerMigration } from "./migration.mjs";

Hooks.once("init", () => {
  registerSettings();
  registerGuide();
  registerQueries();
  registerSocket();
  registerNarrator();
  registerChatCommands();
  registerActionMarks();
  registerChatBar();
  registerTypingIndicator();
  registerChatRender();
  registerChatLog();
  registerSceneTalk();
  registerHistory();
  registerBubbles();
  registerMigration();
  foundry.applications.handlebars.loadTemplates(Object.values(TEMPLATES));
  const module = game.modules.get(MODULE_ID);
  module.api = createApi(module);
});

Hooks.once("ready", () => {
  const module = game.modules.get(MODULE_ID);
  log(`${MODULE_TITLE} ${module.version} pronto | Foundry ${game.version} | ${game.system.id} ${game.system.version}`);
  Hooks.callAll("tbg.ready", module.api);
});
