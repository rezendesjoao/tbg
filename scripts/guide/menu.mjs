import { MODULE_ID } from "../constants.mjs";
import { localize } from "../utils.mjs";
import { writeGuide } from "./guide.mjs";

/** Confirmação aberta pelo botão das configurações; `registerMenu` só aceita uma classe de aplicação. */
class GuideDialog extends foundry.applications.api.DialogV2 {
  static DEFAULT_OPTIONS = {
    window: { title: "TBG.Guide.title", icon: "fa-solid fa-book-open" },
    buttons: [
      { action: "write", label: "TBG.Guide.write", icon: "fa-solid fa-book", default: true, callback: () => writeGuide() },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark" }
    ]
  };

  /** O conteúdo do diálogo não passa por tradução automática, só título e botões. */
  _initializeApplicationOptions(options) {
    options.content = `<p>${localize("TBG.Guide.confirm")}</p>`;
    return super._initializeApplicationOptions(options);
  }
}

/** Botão "Criar guia no diário" nas configurações do TBG, só para o Mestre. Chamar no `init`, depois das settings. */
export function registerGuide() {
  game.settings.registerMenu(MODULE_ID, "guide", {
    name: "TBG.Guide.menu.name",
    label: "TBG.Guide.menu.label",
    hint: "TBG.Guide.menu.hint",
    icon: "fa-solid fa-book-open",
    type: GuideDialog,
    restricted: true
  });
}
