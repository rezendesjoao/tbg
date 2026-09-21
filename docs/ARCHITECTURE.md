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
| Shift+Enter | Plugin ProseMirror próprio registrado no hook `createProseMirrorEditor` só quando `plugins.chatInput` é um `ChatInputPlugin`, e reordenado para a frente do registro | Único caminho com acesso ao `EditorView` para enviar e limpar o editor; `ProseMirrorEditor.create` faz `Object.assign({}, defaults, plugins)`, então sem reordenar o `keyMaps` do core consumiria o Shift+Enter antes. O core reserva a chave `chatInput` em **todo** editor (`buildDefaultPlugins`), então testar só a chave instalava o plugin em diários e descrições: limite de 150, Shift+Enter postando o diário e selo de digitação |
| Dados | `flags.tbg.*` em ChatMessage (`kind`, `speaker`) | O Foundry sincroniza flags sozinho |
| Socket | `module.tbg` só para efêmeros | Nada persistente por socket |
| Medidas do balão | Fonte 16 px, altura de linha 1,25, preenchimento 2 px × 7 px, borda de 1 px e raio de 6 px, tudo em variáveis `--tbg-bubble-*`; retrato num quadrado escuro de cantos arredondados, encostado na borda esquerda | Balão colado no texto, como o do Habbo: a fala pesa mais que a moldura. Variáveis para ajustar sem mexer nas regras |
| Cabeçalho do balão | Retrato e `Nome:` em linha com a fala, que quebra por baixo; a fala num `span` próprio e os parágrafos do conteúdo como inline, com quebra entre eles | Balão mais compacto, no formato `**Nome:** texto` do Habbo. O `span` separado deixa a edição da mensagem trocar só a fala; sem o `p` inline, a primeira linha da fala desceria para baixo do nome |
| Retrato no cartão | O TBG sempre insere o seu e o CSS o esconde com `:has(.message-header img)` quando o sistema já desenhou um | Sistemas como o dnd5e inserem o avatar em `renderChatMessageHTML` depois do nosso hook, então nenhuma checagem em JavaScript no momento do hook enxerga o avatar deles |
| Limite de caracteres | Constante `CHAT_MAX_LENGTH` em `constants.mjs`, aplicada por `filterTransaction` no plugin ProseMirror; transações que encurtam passam sempre | Recusar a transação inteira cobre digitação e colagem sem truncar texto pelas costas do usuário. Não é setting porque o Foundry só usa o padrão de uma setting quando o mundo nunca a gravou, e a tela de configurações grava todas ao salvar: o limite acabava congelado no valor antigo de cada mundo. Sem a exceção para encurtar, um texto acima do limite trancaria o editor |
| Digitação | Socket `module.tbg` com reenvio a cada segundo enquanto o texto muda, fim explícito após três segundos sem mudança ou ao perder o foco, expiração de quatro segundos no destinatário e eco local em quem digita; o falante anunciado fica guardado e, narrando, não há falante | Texto parado no campo não é digitação. A expiração só cobre pacote perdido ou cliente que caiu. O eco local é necessário porque `game.socket.emit` não devolve o pacote a quem enviou. Guardar o falante encerra o selo certo quando se troca de token no meio |
| Empurrão sem relógio | `#clockStale()` conclui o empurrão quando não houve quadro recente, em vez de olhar `document.hidden` | Uma aba pode se declarar visível e mesmo assim não receber quadros de `requestAnimationFrame`; nesse estado os balões nasceriam empilhados no mesmo ponto |
| Selo de digitação | Classe própria, montada por DOM de forma síncrona, posicionada em coordenadas de mundo dentro da arte do token e dimensionada como fração do token | Preso ao token, precisa encolher e crescer com o mapa; usar a escala de tela dos balões o faria transbordar o token quando afastado. Com template assíncrono, um `hide` que chegasse antes do elemento existir deixava um selo órfão |
| Nome na ação | Nem o comando `*texto*` nem o `/me` do core prefixam o nome no conteúdo; o `emote` do core é envolvido em `CHAT_COMMANDS` e tem o conteúdo devolvido ao texto limpo que ele mesmo capturou em `match[2]` | O cartão do chat já imprime o alias no cabeçalho (`templates/sidebar/chat-message.hbs`), então prefixar mostrava o nome duas vezes; e no balão, que já sai do token, o nome é ruído. Reescrever o conteúdo na origem evita procurar prefixo por texto depois |
| Cor do contador | Branco com `-webkit-text-stroke` de 2px e `paint-order: stroke fill`, interpolando até vermelho com `color-mix` guiado pela custom property `--tbg-char-ratio` | Medido no Chromium 152 do Foundry 14.367: sem contorno o texto some no fundo claro, 3px fecha os dígitos e quatro `text-shadow` ficam irregulares |
| Visibilidade | Balões e letreiros exigem `message.isContentVisible` | `visible` é verdadeiro para todos num sussurro com rolagem, e o servidor manda toda mensagem a todo cliente; `isContentVisible` também esconde a mensagem cega do próprio autor, como o `???` do log |
| Balão de fala | Só para `isSpeech(message)`: comando do TBG, ou tipo `base` em IC/EMOTE, sem rolagem | Cartões de sistema sussurrados viravam balão de sussurro com o HTML do cartão (vazio no dnd5e 6, que renderiza o cartão depois). Um cartão de tipo `base` criado no modo em personagem continua indistinguível de uma fala criada por macro, e segue virando balão se não for reconhecido como uso |
| Uso da ficha | Resolvedor genérico em `chat/usage-item.mjs`: varre `system`, as flags de outros pacotes e as opções das rolagens; depois atributos `data-item-*`; depois títulos visíveis. Só aceita item do ator falante, de `ChatMessage.getSpeakerActor` | Core não tem hook de item usado e cada sistema guarda o item num lugar (dnd5e 6 em `system.item`, PF2e em `flags.pf2e.origin`, Daggerheart em `system.source.item`, OP RPG em `flags.dnd5e.item` e `data-item-id`). Ler os dados sem chave de sistema não prende a nenhum schema. `message.speakerActor` cai para `author.character`. Exigir o dono barra o item do conjurador numa salvaguarda rolada pelo alvo; um id recusado como UUID não volta como id solto, porque o ator sintético tem os ids de item do base |
| Rótulo do uso | Nome do item; sem item e com rolagem, a flag `core.initiativeRoll`, o primeiro título do `flavor`, a primeira linha dele ou `roll.options.flavor`; sem rótulo, nada | Nunca o resultado nem a fórmula: a D2 (balão de dado) segue vetada, e um `/roll 1d20` cru não é ação da ficha |
| Deduplicação do uso | Sem estado: a mensagem que referencia, em qualquer string de 16 caracteres, um uso anterior do mesmo `actor.uuid` não gera balão; nem o mesmo uso repetido em 1,5 s. Só contam usos cujo conteúdo este cliente vê | Um clique no dnd5e gera cartão, ataque e dano ligados por `system.origin`. Lendo só `game.messages`, o F5 não repete. Clientes podem divergir de propósito: um cartão privado não cala, para os jogadores, a rolagem pública que o segue. `actor.uuid` porque tokens não vinculados compartilham o id do ator base |
| Nome no uso | O alias do falante quando difere do nome do ator; senão o nome do token. Token que o cliente não vê não ganha balão | O alias escolhido de propósito (combatente renomeado, macro que fala como "???") é o que o autor quis mostrar; o alias igual ao nome do ator é só o padrão do sistema e revelaria um NPC disfarçado. Um balão escondido ainda empurraria os vizinhos e denunciaria onde o token está. Sistemas que gravam só o ator caem no único token dele na cena |
| Letreiro de narração | Container `#tbg-banners` dentro de `#ui-middle`, montado no `ready`; subida por `Element.animate` no `transform` do cartão, na mesma velocidade para todos, e empurrão por `Element.animate` no `translate` do elemento externo; remoção por timer | `#ui-middle` é marcação estática, fica acima do canvas e do HUD (z 30) e abaixo de janelas e notificações, escala com `--ui-scale` e não depende da cena. A subida tem início e fim conhecidos, então é transição pontual, e com propriedades diferentes subida e empurrão compõem. Velocidade única porque, com distância fixa e duração por texto, um letreiro curto alcançava o longo que acabara de empurrar. Medidas vêm de `offsetHeight`, porque o `transform` do pai escala `getBoundingClientRect` |
| Abas do chat (C2) | Com o Custom Chat Tabs, três abas registradas pela API dele no hook `custom-chat-tabs.init` (ON, OFF e ROLL), `setActiveTab` no ON e CSS com `:has([data-tab="tbg-on"])` escondendo All, IC, OOC e Rolls | O CCT fixa a aba All (`removable: false`) e sempre abre nela. Só renomear IC, OOC e Rolls deixaria sem aba, com o All escondido, tudo que não é IC, OOC nem rolagem: a narração (estilo OTHER) e os cartões de item sem rolagem. As três abas do TBG dividem toda mensagem: ON = `isSpeech` sem o `/ooc`; OFF = OOC, `/ooc` e sussurro digitado sem falante; ROLL = o resto. O `:has` só esconde enquanto as abas do TBG existem |
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
    kinds.mjs        resolveKind(message) e isSpeech(message)
    speaker.mjs      speakerToken(message), actorToken(actor), speakerImage(message)
    commands.mjs     /say /shout /think *ação* /n /ooc e o falante de sussurros
    input.mjs        plugin ProseMirror: Shift+Enter grita, limite de caracteres, aviso de mudança
    counter.mjs      contador de caracteres junto aos modos de mensagem
    typing.mjs       TypingAnnouncer: socket do indicador, ociosidade, foco e eco local
    usage.mjs        resolveUsage(message) e isRepeatedUsage(message, usage)
    usage-item.mjs   usedItem(message, actor): o item do falante, sem chave de sistema
    tabs.mjs         abas ON, OFF e ROLL registradas no Custom Chat Tabs
    narrator.mjs     interruptor, botão, atalho e dados de narração
    render.mjs       tema do cartão: classes, retrato, agrupamento
  bubbles/
    bubble.mjs       um balão: elemento, medidas, geometria, layout
    layer.mjs        camada no HUD: hooks, fila, empurrão, relógio, remoção
    typing-indicator.mjs  selo de digitação encaixado no canto superior direito do token
  banners/
    banner.mjs       um letreiro: elemento, duração, subida, empurrão, saída
    layer.mjs        camada em #ui-middle: hooks de narração, pilha, remoção
styles/  tbg.css (variáveis) · bubbles.css · banners.css · chat.css
templates/  bubble.hbs · banner.hbs
lang/  en.json · pt-BR.json
```

## Fluxos

**Balão (A1).** `createChatMessage` dispara em todos os clientes → `BubbleLayer.onMessage` descarta mensagens cujo conteúdo o cliente não vê, desvia para o balão de uso (A9) o que for ação da ficha e, do resto, só aceita mensagens de fala com tipo que tem balão → resolve o token do `speaker` na cena atual → enriquece o conteúdo com `TextEditor.enrichHTML` (segredos só para dono ou GM) → renderiza `templates/bubble.hbs`, anexa em `#tbg-bubbles`, mede → empurra os balões que sobrepõe (free flow) ou todos (linha a linha) → todos os balões são reposicionados na hora, e de novo a cada `refreshToken` e `updateToken` do token que fala → o relógio `requestAnimationFrame` sobe cada balão em pixels de tela, suaviza o empurrão e posiciona em coordenadas de mundo a partir de `token.center` e `token.document.y` (o core grava a posição interpolada no documento durante a animação, então o balão acompanha o movimento) → ao passar do limite de subida ou do tempo máximo, esvanece e sai.

Escala: em `screen` o balão recebe `transform: scale(1/zoom)` com origem no centro inferior, ficando do mesmo tamanho na tela em qualquer zoom; em `world` ele escala com o mapa como o balão do core.

**Modos de fala (A3).** `/say`, `/shout`, `/think`, `*ação*` e `/n` são entradas em `ChatLog.CHAT_COMMANDS`; cada uma grava `flags.tbg.kind`. Com a setting `autoInCharacter` ligada, o hook `chatMessage` trata texto sem comando como fala em personagem quando há falante (token selecionado ou personagem atribuído) e o modo de mensagem é o público padrão, porque no v14 o modo "Public as User" transforma texto simples em OOC mesmo com token selecionado. `/me` e `/w` são do core: `/me` vira `action` pelo estilo EMOTE; para `/w`, o hook `chatMessage` guarda o falante em `flags.tbg.speaker` (o core o apaga em sussurros) e `preCreateChatMessage` o restaura quando há token, para o sussurro sair em personagem e virar balão só para quem recebe.

**Narrador (B1).** Setting de cliente `narratorActive` (só GM). Com ele ligado, o hook `chatMessage` intercepta texto sem comando, cria a mensagem com `speaker.alias` = nome do narrador, estilo OTHER e `flags.tbg.kind = "narration"`, e retorna `false`. Sem token no falante, não há balão sobre token; a narração vira letreiro (B8). Comandos (`/roll`, `/w`, `*ação*`) passam direto para o core. Narrando, o selo de digitação não aparece.

**Letreiro (B8).** `createChatMessage` com `resolveKind === "narration"` e `isContentVisible` → `BannerLayer.show` renderiza `templates/banner.hbs` em `#tbg-banners`, mede, empurra os letreiros vivos em altura + 12 px, limita a três na tela e anima: nasce com a base a 62% da altura do container e sobe a uma velocidade única (25% da altura a cada 8 s) por `max(setting, 2 s + 60 ms por caractere)`, até 30 s, encurtando se chegaria ao topo antes, com fade no começo e no fim. Editar a mensagem troca o texto mantendo a base e empurra os letreiros de cima pela diferença de altura. Movimento reduzido do sistema ou modo fotossensível do Foundry tiram a subida. Apagar a mensagem remove o letreiro.

**Uso da ficha (A9).** Para mensagem sem `flags.tbg.kind` e com ator falante, `resolveUsage` procura o item do ator e, sem item, o rótulo da rolagem. Havendo resultado, `BubbleLayer` acha o token (o do falante; sem token no falante, o único token do ator na cena), descarta token que o cliente não vê e repetição (`isRepeatedUsage`) e mostra o balão bege `USAGE_KIND` "Nome usou X" ou "Nome rolou X", com a imagem do item ou um dado. Updates da mensagem não mexem nesse balão.

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
- `ProseMirrorEditor.buildDefaultPlugins` põe `chatInput: new Plugin({})` em todo editor como reserva de ordem (`client/applications/ux/prosemirror-editor.mjs:311`); o do chat é trocado por `ChatInputPlugin.build(...)` em `ChatLog#_onConfigurePlugins`, que guarda a instância em `spec.instance`.
- `ChatMessage#visible` é verdadeiro para todos em sussurro com rolagem (`client/documents/chat-message.mjs:101-107`); `isContentVisible` (`:70-82`) é o portão de privacidade. `speakerActor` cai para `author.character`; `ChatMessage.getSpeakerActor(speaker)` não.
- `message.toObject().rolls` são strings JSON; as opções ficam em `message.rolls[i].options`. `foundry.utils.parseUuid(uuid).id` é o último segmento, não o id do item.
- ChatMessage tem campo `title` no v14; o dnd5e 6 grava "Item - Atividade" nele e deixa `content` vazio, renderizando o cartão depois do hook `renderChatMessageHTML`.
- `#ui-middle` é marcação estática de `templates/views/game.hbs`, com `transform: scale(var(--ui-scale))` e `z-index: var(--z-index-app)`; janelas começam em `--z-index-window` (100).

## Prior art estudado

- Cautious Gamemaster's Pack: sobrescrita de falante no hook `chatMessage` e `preCreateChatMessage` com `updateSource`; digitação via socket com throttle de 250 ms.
- Talk To Me: balões em PIXI reposicionados em `canvasPan`, `updateToken` e `refreshToken`.
- Nitro (cliente Habbo open-source): empilhamento, free flow, larguras e transição de 200 ms.
