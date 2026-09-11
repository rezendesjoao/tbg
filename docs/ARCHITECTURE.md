# TBG — Arquitetura e notas da API v14

## Decisões

| Decisão | Escolha | Por quê |
|---|---|---|
| Linguagem/build | **JavaScript ESM puro, sem bundler**; CSS puro | O Foundry carrega `import` nativo; `flags.hotReload` recarrega CSS/HBS/JSON sem F5; mesmo padrão dos outros projetos do autor |
| Id / pasta / título | id `tbg`, pasta `tbg`, título `TBG` | O id precisa ser igual ao nome da pasta |
| Compatibilidade | `{ "minimum": "14", "verified": "14.367" }`, **sem `maximum`** | `maximum` é bloqueio duro (o módulo se recusa a carregar acima dele); os recursos usados são exclusivos do v14 |
| Dependências | **Nenhuma obrigatória.** Sem libWrapper no núcleo (tudo via hooks e `CONFIG.*`); sem socketlib (`game.socket` + `CONFIG.queries`). `relationships.recommends`: Narrator Tools, Custom Chat Tabs, CGMP | Menos atrito para instalar; libWrapper só se um item futuro exigir override real |
| UI | ApplicationV2 + HandlebarsApplicationMixin; DialogV2; zero jQuery | AppV1 é removida no v16 |
| CSS | Layer `modules` (automática no v13+); variáveis `--tbg-*`; respeitar `CONST.CSS_THEMES` (dark/fantasy/scifi) | Vence o core sem `!important` |
| Balões | **HTML dentro de `canvas.hud.element`** (container próprio `#tbg-bubbles`), `left/top` em coordenadas de mundo a partir de `token.center` / `token.w` / `token.h`; reposicionamento em `canvasPan`, `refreshToken`, `updateToken`, `deleteToken`, `canvasReady`; balão do core cancelado com `Hooks.on("chatBubbleHTML", () => false)` | É o mesmo mecanismo do core (o HUD já acompanha pan/zoom); HTML dá CSS, fontes, emoji e transições de graça |
| Falante | **Nativo intocado** (`ChatMessage.getSpeaker` do core). Narrador = modo de mensagem custom em `CONFIG.ChatMessage.modes`, com fallback no hook `chatMessage` | Atende "clicou no boneco, fala como ele" e ainda dá o interruptor |
| Comandos | `ChatLog.CHAT_COMMANDS` (v14) | API oficial; `MESSAGE_PATTERNS` some no v16 |
| Dados | `flags.tbg.*` em ChatMessage (`kind`, `mode`, `room`, `replyTo`, `edited`) e em Actor/Token (`favorite`, `title`) | O Foundry sincroniza flags sozinho |
| Socket | `module.tbg` só para efêmeros (digitando…, foco) | Nada persistente passa por socket |
| i18n | `lang/pt-BR.json` + `lang/en.json`, chaves `TBG.*` | pt-BR é o público principal |
| Licença | MIT | Padrão da comunidade |

## Estrutura alvo (fases 1–2)

```
tbg/
├─ module.json
├─ scripts/
│  ├─ tbg.mjs                 entrada: init/ready; registra settings, comandos, modo narrador, hooks; API pública
│  ├─ constants.mjs           MODULE_ID, KINDS, SOCKET_EVENT, SOCKET_TYPES
│  ├─ utils.mjs               log/warn/debug, t()
│  ├─ settings.mjs            settings world/client
│  ├─ sockets.mjs             emit/on de `module.tbg`; CONFIG.queries
│  ├─ bubbles/
│  │  ├─ engine.mjs           A1: BubbleLayer — cria #tbg-bubbles no HUD, fila por token, layout free-flow, relógio
│  │  └─ bubble.mjs           uma bolha: elemento, medida, posição, fade
│  ├─ chat/
│  │  ├─ commands.mjs         A3/B4: /shout /think /say /n /anuncio; parse de *ação*
│  │  ├─ narrator.mjs         B1: modo de mensagem + atalho + botão
│  │  ├─ render.mjs           C1: renderChatMessageHTML → classes, retrato, agrupamento
│  │  ├─ typing.mjs           A5
│  │  └─ director.mjs         B4: menu de contexto do token + mini-input
│  └─ api.mjs                 game.modules.get("tbg").api
├─ styles/  tbg.css · bubbles.css · chat.css
├─ templates/  bubble.hbs · chat-extras.hbs
├─ lang/  en.json · pt-BR.json
└─ .github/workflows/release.yml
```

## Fluxos principais

**Balão (A1).** `createChatMessage` (dispara em todos os clientes) → `engine.onMessage(msg)` → resolve o token do `speaker` (token; senão o primeiro token do ator na cena) → checa `kind` e visibilidade (`msg.visible`, whisper, `flags.tbg.room`) → `bubble.render()` em `#tbg-bubbles` com `left/top` em coordenadas de mundo → `engine.push(tokenId, bubble)` empurra os sobrepostos (free flow) → o relógio sobe todos → ao cruzar o topo da faixa, fade-out e remoção. `canvasPan` só ajusta o contra-escalonamento opcional; o HUD do core já move o container.

**Narrador (B1).** Seletor de modo nativo → `CONFIG.ChatMessage.modes.tbgNarrator.handler(data)` define `speaker = { alias, scene }`, `style = OTHER`, `flags.tbg.kind = "narration"`. Sem token no speaker, o core não gera balão. `renderChatMessageHTML` aplica `.tbg-narration`. Se o handler do modo não permitir mexer em `speaker`, o fallback é `Hooks.on("chatMessage", (log, message, chatData) => { ...; ChatMessage.implementation.create(chatData); return false; })`, que é o padrão do Cautious Gamemaster's Pack.

**Digitando (A5).** `keydown`/`keyup` em `#chat-message` (o editor ProseMirror do v14 mantém esse id) → `emit("typing", { tokenId, sceneId })` com throttle de 250 ms → cada cliente mostra o balão de pontinhos sobre o token e o esconde após 5 s sem pacote ou ao receber `typingEnd`.

## Notas da API v14 (confirmadas na documentação 14.365 e nas release notes até 14.367)

- **ChatMessage**: schema com `author`, `content`, `speaker { scene, actor, token, alias }`, `style` (`CONST.CHAT_MESSAGE_STYLES`: OTHER 0, OOC 1, IC 2, EMOTE 3), `emote`, `whisper[]`, `blind`, `rolls`, `flags`, `system`, `type` (subtipo). `speaker.alias` é "um nome sobrescrito no lugar do nome do ator/token". `ChatMessage.getSpeaker()` assume o token controlado, depois o personagem atribuído, depois o usuário. `applyMode` substitui `applyRollMode`. — https://foundryvtt.com/api/classes/foundry.documents.ChatMessage.html
- **Modos de mensagem** (14.355): `CONFIG.ChatMessage.modes = { chave: { handler(data), icon, label } }` substitui `CONST.DICE_ROLL_MODES` e `CONFIG.Dice.rollModes`; setting `core.messageMode`. Módulos podem registrar modos próprios. — https://github.com/foundryvtt/foundryvtt/issues/8856
- **Comandos** (14.355): `ChatLog.CHAT_COMMANDS[nome] = { rgx, fn(command, match, chatData, createOptions) }`; `fn` retorna `false` para impedir a criação; `ChatLog.parse()` devolve `[command, match, fn]`. `MESSAGE_PATTERNS` está deprecado até o v16. — https://github.com/foundryvtt/foundryvtt/issues/13080
- **ChatBubbles**: `foundry.canvas.animation.ChatBubbles`, instância `canvas.hud.bubbles`; API pública só `say()`, `broadcast()`, `bubbles` (um balão por token; populado de fato desde 14.362), `element`, `template` (`templates/hud/chat-bubble.hbs`). Hook `chatBubbleHTML(token, html, message, options)`; retornar `false` cancela. Bug aberto: `options.cssClasses` vira uma classe única com vírgulas (#11178). — https://foundryvtt.com/api/classes/foundry.canvas.animation.ChatBubbles.html
- **HUD**: `HeadsUpDisplayContainer` é "uma Application do tamanho do canvas que renderiza HTML por cima do canvas"; `align()` realinha ao pan/zoom. Balões do core são HTML, não PIXI. — https://foundryvtt.com/api/classes/foundry.applications.hud.HeadsUpDisplayContainer.html
- **Despacho de balão**: `ChatMessages#sayBubble(message)` em `_onCreate`. Desde 14.355/14.366 o balão só aparece por padrão se o modo for `"ic"` e não houver rolagens. — https://github.com/foundryvtt/foundryvtt/issues/14607
- **Input do chat**: editor ProseMirror inline (`ChatInputPlugin`, `ChatMenuPlugin`); autocomplete exige plugin via `ChatLog#_onConfigurePlugins`. Hooks `chatInput(event, { recordPending })` e `renderChatInput(app, elements, context, options)` (o input é re-parentado entre sidebar, popout e overlay de notificações). — https://foundryvtt.com/api/functions/hookEvents.renderChatInput.html
- **Hooks úteis**: `chatMessage(chatLog, message, chatData)` (antes do parse; `false` suprime), `preCreateChatMessage` (só no cliente que envia; `updateSource`), `createChatMessage` (todos), `renderChatMessageHTML(message, html, context)` (substitui `renderChatMessage`), `chatBubbleHTML`, `canvasPan`, `refreshToken`, `updateToken`, `controlToken`, `hoverToken`, `getSceneControlButtons(controls)` (Record, não array), `renderSceneControls`. — https://foundryvtt.com/api/modules/hookEvents.html
- **UI**: ChatLog é `HandlebarsApplicationMixin(AbstractSidebarTab)`; CSS Cascade Layers desde v13 (`@layer reset, variables, elements, blocks, applications, compatibility, layouts, system, modules, exceptions`); v14 traz janelas destacáveis (o ChatLog pode virar janela separada do navegador). — https://foundryvtt.wiki/en/development/guides/css-cascade-layers
- **Sockets**: `"socket": true` + `game.socket.emit("module.tbg", …)`; o emissor não recebe o próprio pacote. `CONFIG.queries["tbg.x"]` + `user.query()` para pedido/resposta direcionado. — https://foundryvtt.wiki/en/development/api/sockets
- **Manifesto**: obrigatórios `id`, `title`, `type`, `version`, `media`; `compatibility { minimum, verified, maximum }`; `relationships` (não `dependencies`); `styles` aceita `{ src, layer }`; `flags.hotReload`. — https://foundryvtt.com/api/interfaces/foundry.packages.types.ModuleManifestData.html

## Riscos a validar em runtime

- Conteúdo padrão de `ChatLog.CHAT_COMMANDS` (a documentação omite): inspecionar no console antes de registrar nomes, para não colidir com os do core.
- Se o `handler` de `CONFIG.ChatMessage.modes` roda para mensagens digitadas no input e aceita trocar `speaker`. Fallback: hook `chatMessage`.
- Janelas destacadas (v14): a camada de balões fica no canvas (janela principal); qualquer UI junto do input precisa usar `renderChatInput`.
- `canvas.hud.bubbles.element.id` e a duração interna do core: só ler em runtime; o TBG não depende deles.

## Prior art estudado

- **Cautious Gamemaster's Pack** (`chat-resolver.js`): sobrescrita de falante no hook `chatMessage` e `preCreateChatMessage` com `updateSource`; (`typing-notifier.js`): digitação via socket com throttle 250 ms e timeout 5 s, funcionando no input do v14.
- **Talk To Me** (`bubbles.js`): balões em PIXI reposicionados em `canvasPan`/`updateToken`/`refreshToken`/`controlToken`. O TBG usa HTML no HUD, mas os hooks de reposicionamento são os mesmos.
- **Nitro** (cliente Habbo open-source): `ChatWidgetView.tsx`, `useChatWidget.ts`, `RoomChatSettings.ts` — empilhamento, free flow, larguras e transição de 200 ms.
