import { CHAT_MAX_LENGTH, MODULE_ID } from "../constants.mjs";
import { localize } from "../utils.mjs";
import { narratorName } from "../chat/narrator.mjs";

const JOURNAL_NAME = "Guia do TBG";
const TEMPLATE_ROOT = `modules/${MODULE_ID}/templates/guide`;
const SORT_STEP = 100000;
const PORTRAIT = "icons/svg/mystery-man.svg";

/** Páginas do guia, na ordem de leitura; as do Mestre ficam ocultas para os jogadores. */
const PAGES = [
  { key: "inicio", name: "Bem-vindo" },
  { key: "falar", name: "Falando pelo personagem" },
  { key: "modos", name: "Modos de fala" },
  { key: "baloes", name: "Os balões" },
  { key: "digitando", name: "Digitando…" },
  { key: "ficha", name: "Ações da ficha" },
  { key: "abas", name: "Abas ON, OFF e ROLL" },
  { key: "etiqueta", name: "Boas práticas" },
  { key: "mestre-narracao", name: "Mestre: narração", isGMOnly: true },
  { key: "mestre-configuracoes", name: "Mestre: configurações", isGMOnly: true }
];

/** Cria o diário do guia ou, se ele já existe, troca as páginas pela versão atual, mantendo pasta e permissões. */
export async function writeGuide() {
  const pages = await renderPages();
  const existing = game.journal.find(entry => entry.getFlag(MODULE_ID, "guide"));
  const entry = existing ? await replacePages(existing, pages) : await createGuide(pages);
  ui.notifications.info(localize(existing ? "TBG.Guide.updated" : "TBG.Guide.created"));
  entry.sheet.render(true);
}

async function renderPages() {
  const context = guideContext();
  const render = foundry.applications.handlebars.renderTemplate;
  return Promise.all(PAGES.map(async ({ key, name, isGMOnly }, index) => ({
    name,
    type: "text",
    sort: (index + 1) * SORT_STEP,
    title: { show: false, level: 1 },
    text: { format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML, content: await render(`${TEMPLATE_ROOT}/${key}.hbs`, context) },
    ownership: { default: pageOwnership(isGMOnly) },
    flags: { [MODULE_ID]: { guidePage: key } }
  })));
}

/** Herdar precisa ser explícito: uma permissão vazia é gravada como "nenhuma" e esconderia a página dos jogadores. */
function pageOwnership(isGMOnly) {
  const { INHERIT, NONE } = CONST.DOCUMENT_OWNERSHIP_LEVELS;
  return isGMOnly ? NONE : INHERIT;
}

/** Valores que mudam por mesa entram no texto na hora de gerar: limite, nome do narrador e atalho. */
function guideContext() {
  const [binding] = game.keybindings.get(MODULE_ID, "toggleNarrator");
  const narratorKey = binding ? foundry.applications.sidebar.apps.ControlsConfig.humanizeBinding(binding) : "—";
  return { maxLength: CHAT_MAX_LENGTH, narratorName: narratorName(), narratorKey, portrait: PORTRAIT };
}

function createGuide(pages) {
  return CONFIG.JournalEntry.documentClass.create({
    name: JOURNAL_NAME,
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
    flags: { [MODULE_ID]: { guide: true } },
    pages
  });
}

async function replacePages(entry, pages) {
  await entry.deleteEmbeddedDocuments("JournalEntryPage", entry.pages.map(page => page.id));
  await entry.createEmbeddedDocuments("JournalEntryPage", pages);
  return entry;
}
