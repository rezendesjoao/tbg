# TBG — Arquitetura e notas da API v14

## Decisões

| Decisão | Escolha | Por quê |
|---|---|---|
| Linguagem e build | JavaScript ESM puro, sem bundler; CSS puro | O Foundry carrega `import` nativo; `flags.hotReload` recarrega CSS, HBS e JSON sem F5 |
| Id, pasta e título | id `tbg`, pasta `tbg`, título `TBG` | O id precisa ser igual ao nome da pasta |
| Compatibilidade | `{ "minimum": "14", "verified": "14.367" }`, sem `maximum` | `maximum` é bloqueio duro; os recursos usados são exclusivos do v14 |
| Dependências | Nenhuma obrigatória. Sem libWrapper, sem socketlib | Menos atrito; tudo vem de hooks, `CONFIG` e eventos do core |
| Interface | ApplicationV2 + HandlebarsApplicationMixin; DialogV2; zero jQuery | AppV1 é removida no v16 |
| CSS | Layer `modules` (automática); variáveis `--tbg-*` | Vence o core sem `!important` |
| Balões | HTML dentro de `#hud` (container `#tbg-bubbles`), posicionado em coordenadas de mundo; core silenciado com `options.chatBubble = false` em `preCreateChatMessage` | Mesmo mecanismo do core; o HUD já acompanha pan e zoom |
| Posição dos balões | Escrita em `transform: translate3d(...) scale(...)` com `transform-origin: 0 0`, recalculada por evento (`say`, `refreshToken`, `updateToken`) e não só pelo relógio | O navegador suspende `requestAnimationFrame` com a aba oculta e o canvas inteiro congela junto; sem os hooks a pilha e o acompanhamento do token só se corrigiriam ao voltar para a aba |
| Falante | Nativo intocado (`ChatMessage.getSpeaker`) | Atende "clicou no boneco, fala como ele" |
| Modo Narrador | Interruptor interno (setting de cliente) aplicado no hook `chatMessage`, com botão em `#message-modes` e atalho Alt+N | Um modo custom em `CONFIG.ChatMessage.modes` fica gravado em `core.messageMode`; se o módulo for desativado, `ChatMessage.applyMode` quebra ao ler `cfg.handler` de um modo inexistente e nenhuma mensagem é criada |
| Comandos | `ChatLog.CHAT_COMMANDS` | API oficial do v14; `MESSAGE_PATTERNS` some no v16 |
| Shift+Enter | Plugin ProseMirror próprio registrado no hook `createProseMirrorEditor` (o editor do chat é o único com a chave `chatInput`) e reordenado para a frente do registro | Único caminho com acesso ao `EditorView` para enviar e limpar o editor; `ProseMirrorEditor.create` faz `Object.assign({}, defaults, plugins)`, então sem reordenar o `keyMaps` do core consumiria o Shift+Enter antes |
| Dados | `flags.tbg.*` em ChatMessage (`kind`, `speaker`) | O Foundry sincroniza flags sozinho |
| Socket | `module.tbg` só para efêmeros | Nada persistente por socket |
| Retrato no cartão | O TBG sempre insere o seu e o CSS o esconde com `:has(.message-header img)` quando o sistema já desenhou um | Sistemas como o dnd5e inserem o avatar em `renderChatMessageHTML` depois do nosso hook, então nenhuma checagem em JavaScript no momento do hook enxerga o avatar deles |
| Limite de caracteres | Constante `CHAT_MAX_LENGTH` em `constants.mjs`, aplicada por `filterTransaction` no plugin ProseMirror; transações que encurtam passam sempre | Recusar a transação inteira cobre digitação e colagem sem truncar texto pelas costas do usuário. Não é setting porque o Foundry só usa o padrão de uma setting quando o mundo nunca a gravou, e a tela de configurações grava todas ao salvar: o limite acabava congelado no valor antigo de cada mundo. Sem a exceção para encurtar, um texto acima do limite trancaria o editor |
| Digitação | Socket `module.tbg` com reenvio a cada segundo e expiração de cinco segundos no destinatário | Nada persistente; se o cliente cair, o indicador some sozinho |
| Nome na ação | Nem o comando `*texto*` nem o `/me` do core prefixam o nome no conteúdo; o `emote` do core é envolvido em `CHAT_COMMANDS` e tem o conteúdo devolvido ao texto limpo que ele mesmo capturou em `match[2]` | O cartão do chat já imprime o alias no cabeçalho (`templates/sidebar/chat-message.hbs`), então prefixar mostrava o nome duas vezes; e no balão, que já sai do token, o nome é ruído. Reescrever o conteúdo na origem evita procurar prefixo por texto depois |
| Cor do contador | Branco com `-webkit-text-stroke` de 2px e `paint-order: stroke fill`, interpolando até vermelho com `color-mix` guiado pela custom property `--tbg-char-ratio` | Medido no Chromium 152 do Foundry 14.367: sem contorno o texto some no fundo claro, 3px fecha os dígitos e quatro `text-shadow` ficam irregulares |
| i18n | `lang/pt-BR.json` e `lang/en.json`, chaves `TBG.*` | pt-BR é o público principal |

## Estrutura

```
scripts/
  tbg.mjs            entrada: init e ready; chama os register…() de cada domínio
  constants.mjs      MODULE_ID, KINDS, BUBBLE_KINDS, SOCKET_EVENT, TEMPLATES
  utils.mjs          log, warn, debug, localize, stripParagraph
  settings.mjs       tabela de settings e registerSettings()
  sockets.mjs        socket module.tbg e CONFIG.queries
  api.mjs            game.modules.get("tbg").api
  chat/
    kinds.mjs        resolveKind(message): flag, sussurro ou estilo
    speaker.mjs      speakerToken(message), speakerImage(message)
    commands.mjs     /say /shout /think *ação* /n /ooc e o falante de sussurros
    input.mjs        plugin ProseMirror: Shift+Enter grita, limite de caracteres, aviso de mudança
    counter.mjs      contador de caracteres junto aos modos de mensagem
    typing.mjs       socket e indicador de digitação sobre o token
    narrator.mjs     interruptor, botão, atalho e dados de narração
    render.mjs       tema do cartão: classes, retrato, agrupamento
  bubbles/
    bubble.mjs       um balão: elemento, medidas, geometria, layout
    layer.mjs        camada no HUD: hooks, fila, empurrão, relógio, remoção
styles/  tbg.css (variáveis) · bubbles.css · chat.css
templates/  bubble.hbs
lang/  en.json · pt-BR.json
```

## Fluxos

**Balão (A1).** `createChatMessage` dispara em todos os clientes → `BubbleLayer.onMessage` descarta rolagens, mensagens invisíveis e tipos sem balão → resolve o token do `speaker` na cena atual → enriquece o conteúdo com `TextEditor.enrichHTML` (segredos só para dono ou GM) → renderiza `templates/bubble.hbs`, anexa em `#tbg-bubbles`, mede → empurra os balões que sobrepõe (free flow) ou todos (linha a linha) → todos os balões são reposicionados na hora, e de novo a cada `refreshToken` e `updateToken` do token que fala → o relógio `requestAnimationFrame` sobe cada balão em pixels de tela, suaviza o empurrão e posiciona em coordenadas de mundo a partir de `token.center` e `token.document.y` (o core grava a posição interpolada no documento durante a animação, então o balão acompanha o movimento) → ao passar do limite de subida ou do tempo máximo, esvanece e sai.

Escala: em `screen` o balão recebe `transform: scale(1/zoom)` com origem no centro inferior, ficando do mesmo tamanho na tela em qualquer zoom; em `world` ele escala com o mapa como o balão do core.

**Modos de fala (A3).** `/say`, `/shout`, `/think`, `*ação*` e `/n` são entradas em `ChatLog.CHAT_COMMANDS`; cada uma grava `flags.tbg.kind`. Com a setting `autoInCharacter` ligada, o hook `chatMessage` trata texto sem comando como fala em personagem quando há falante (token selecionado ou personagem atribuído) e o modo de mensagem é o público padrão, porque no v14 o modo "Public as User" transforma texto simples em OOC mesmo com token selecionado. `/me` e `/w` são do core: `/me` vira `action` pelo estilo EMOTE; para `/w`, o hook `chatMessage` guarda o falante em `flags.tbg.speaker` (o core o apaga em sussurros) e `preCreateChatMessage` o restaura quando há token, para o sussurro sair em personagem e virar balão só para quem recebe.

**Narrador (B1).** Setting de cliente `narratorActive` (só GM). Com ele ligado, o hook `chatMessage` intercepta texto sem comando, cria a mensagem com `speaker.alias` = nome do narrador, estilo OTHER e `flags.tbg.kind = "narration"`, e retorna `false`. Sem token no falante, não há balão. Comandos (`/roll`, `/w`, `*ação*`) passam direto para o core.

**Tema do chat (C1).** `renderChatMessageHTML` adiciona `tbg-message`, `tbg-kind-*`, `tbg-roll`, a variável `--tbg-author-color`, o retrato do falante e `tbg-continued` quando a mensagem anterior visível é do mesmo autor, falante, tipo e audiência dentro de 5 minutos.

## Notas da API v14 (lidas no fonte 14.367)

- `ChatLog.parse(message)` itera `CHAT_COMMANDS` em ordem de inserção sobre o HTML sem o `<p>` externo; sem comando devolve `"none"`. `processMessage` chama o hook `chatMessage(chatLog, message, chatData)` antes do parse e aborta se ele retornar `false`.
- `ChatMessage#_preCreate` aplica `options.messageMode` e define `options.chatBubble ??= mode === "ic"`; `_onCreate` chama `game.messages.sayBubble` só se `options.chatBubble` for verdadeiro. O hook `preCreateChatMessage` roda no cliente que cria e suas mudanças em `options` viajam para os outros clientes.
- `ChatBubbles#say` limpa `.chat-bubble[data-token-id]`, enriquece o texto, chama `chatBubbleHTML(token, html, message, options)` e cancela se o hook retornar `false`. Container do core: `#chat-bubbles` dentro de `#hud`.
- `#hud` recebe `width/height` do canvas, `left/top` de `canvas.primary.getGlobalPosition()` e `transform: scale(zoom)` com `transform-origin: top left`; `#hud > *` é `position: absolute`. O HUD é renderizado a cada `Canvas#draw` (`renderHeadsUpDisplayContainer`) e seu `innerHTML` é substituído.
- Durante a animação de movimento, `Token#_onAnimationUpdate` grava a posição interpolada em `token.document` (`mergeObject(this.document, animationData)`), então `token.center` e `token.document.y` acompanham o movimento; a posição PIXI `token.y` do container não é confiável.
- O input do chat é um `<prose-mirror id="chat-message">`; `value` devolve o HTML serializado, mas `value = ""` não limpa um editor ativo. O elemento dispara o evento `plugins`, o `ChatLog` adiciona `chatInput`, `keyMaps` e `menu`, e `ProseMirrorEditor.create` mescla tudo sobre os defaults com `Object.assign({}, defaults, plugins)` antes de chamar `Hooks.callAll("createProseMirrorEditor", uuid, plugins, options)`; `Object.values(plugins)` define a ordem em que `handleKeyDown` roda.
- `core.messageMode` é `StringField` sem `choices`; `#message-modes` é montado uma vez em `ChatLog#renderNotifications` a partir de `CONFIG.ChatMessage.modes` e re-parentado entre sidebar, popout e overlay (`renderChatInput` entrega `#message-modes`, `#chat-message`, `#chat-controls`).
- `ChatMessage#renderHTML` gera `li.chat-message.message.flexcol` com classes `ic`, `emote`, `whisper`, `blind` e `borderColor` da cor do autor para OOC; template `templates/sidebar/chat-message.hbs`.
- `game.keybindings.register` só funciona no `init`.

## Prior art estudado

- Cautious Gamemaster's Pack: sobrescrita de falante no hook `chatMessage` e `preCreateChatMessage` com `updateSource`; digitação via socket com throttle de 250 ms.
- Talk To Me: balões em PIXI reposicionados em `canvasPan`, `updateToken` e `refreshToken`.
- Nitro (cliente Habbo open-source): empilhamento, free flow, larguras e transição de 200 ms.
