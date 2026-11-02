# TBG — Briefing de funcionalidades

**Aprovado em 11/09/2026.** Fase 1 entregue na versão 0.2.0 e A5 na 0.3.0 (11/09/2026). A9 e B8 aprovados e entregues na 0.7.0 (21/09/2026). C2 entregue na 0.9.0 (21/09/2026), integrada ao Custom Chat Tabs. D8 aprovada e entregue na 0.10.0 (21/09/2026). Refinamentos de A3 (`/off`), B1 (`= texto =` e cartão de narração) e B8 (balão do narrador) aprovados e entregues na 0.11.0 (21/09/2026). Balão em linha única (A1 e B8) e limite de 100 caracteres aprovados e entregues na 0.12.0 (12/10/2026). Refinamentos de C2 (notificações, cartões sussurrados no ROLL, cartões sem agrupar e aviso para ligar as abas) e o contador fora da barra do chat aprovados e entregues na 0.13.0 (18/10/2026). Em 01/11/2026 o usuário pediu a conversa no jeito das salas de bate-papo dos jogos: D7 (a barra de conversa) e A8 (o Histórico da cena) entregues na 0.14.0, com a voz do Mestre sem token, a subida mais lenta e o chat lateral só com rolagens; C2 saiu. Na 0.14.1 (01/11/2026), o Mestre sem token passou a narrar e o limite subiu para 130 caracteres. Na 0.15.0 (02/11/2026), a ação passou a ir no meio da fala, em negrito, e o fora do personagem, entre colchetes, os dois no balão comum; o balão do narrador nasce mais alto e fica pelo menos 30 segundos. Na 0.16.0 (02/11/2026), todos os balões passaram a sair de uma faixa presa ao topo da tela, numa linha só, com colisão entre todos e subindo aos pulos (A1 e B8). Marque `[x]` quando um item for entregue. A fase indica a ordem de implementação. Esforço: **P** horas · **M** 1–3 dias · **G** semana ou mais. "Sobreposição" cita módulos existentes parecidos (para integrar, não copiar).

Os códigos (A1, B3…) são a forma de se referir a cada ideia em issues, commits e conversas.

---

## Fase 1 — Núcleo de balões e chat

- [x] **A1. Motor de balões "free flow"** — **G** — *o coração do módulo*
  Camada HTML própria que substitui os balões do core (cancelados via hook `chatBubbleHTML`). Toda mensagem em personagem com token na cena vira um balão `**Nome:** texto`, com um único visual padrão (branco, rabinho para baixo). O balão é sempre **uma linha só**: nunca quebra, por mais longa que seja a fala, e cresce por igual para os dois lados. Desde a 0.16.0 (pedido de 02/11/2026, "como no Habbo Hotel"), todo balão sai de uma **faixa presa ao topo da tela**: nasce na mesma linha, embaixo do token que fala, e empurra para cima os balões em que encosta, com colisão entre todos (de tokens diferentes, a narração, o uso da ficha), sem nunca sobrepor. Em vez de subir sem parar, os balões **sobem aos pulos**: de tempos em tempos todos pulam uma linha juntos, num movimento curto, e quem passa do topo some. O balão fica onde foi dito (não segue o token que anda) e acompanha o pan do mapa só na horizontal; tem sempre o mesmo tamanho na tela. Modos "free flow" (o novo só empurra quem ele encosta, formando colunas por grupo de conversa) e "linha a linha" (empurra a faixa inteira). Configurações do Mestre: velocidade de subida, altura da faixa, tempo máximo. Editar a mensagem atualiza o balão. Até a 0.11.0 a fala quebrava na largura máxima, que era configurável; a linha única foi aprovada em 12/10/2026 e entregue na 0.12.0. Até a 0.15.0 os balões nasciam sobre o token, seguiam-no e subiam num relógio contínuo, e os sem token viviam numa camada à parte no meio da tela.
  Sobreposição: nenhuma mantida (o único módulo de duração morreu no v10).

- [x] **A3. Modos de fala** — **M**
  - **Falar** (texto normal ou `/say`): balão normal.
  - **Gritar** (`/shout` ou **Shift+Enter**): negrito, balão maior, ignora qualquer filtro de sala.
  - **Sussurrar** (`/w` nativo): balão itálico cinza só para quem recebe.
  - **Pensar** (`/think` ou `/pensar`): balão-nuvem visível só para o Mestre e o dono.
  - **Ação** (`*texto*` ou `'texto'`, sozinha ou no meio da fala): as marcas somem e a ação sai em negrito no balão comum de quem fala. O `/me` nativo vira uma ação inteira. Até a 0.14 era o comando `*texto*` (a mensagem inteira), num balão bege em itálico e sem nome; a ação no meio da fala foi pedida em 02/11/2026 e entregue na 0.15.0.
  Implementação: `ChatLog.CHAT_COMMANDS` do v14 + `flags.tbg.kind` na mensagem. `/w` e `/me` já são do core; só reaproveitamos o parse.
  Fora do personagem: a mensagem inteira entre colchetes (`[texto]`) ou terminada em `[]` sai no balão comum, translúcido, com o nome do jogador; o `/ooc` do core continua valendo. Pedido em 02/11/2026 e entregue na 0.15.0, no lugar do `/off texto` (0.11.0) e do balão acinzentado.

- [x] **B1. Modo Narrador (interruptor)** — **P/M** — *pedido explícito*
  Um **interruptor "Narrador"** (setting de cliente) com botão 📜 ao lado dos modos de mensagem da sidebar e atalho Alt+N. Enquanto ativo, o que o Mestre digita sai com alias "Narrador" (sem ator/token, portanto sem balão), estilo OTHER e `flags.tbg.kind = "narration"`, num cartão com a cara de uma mensagem de jogador (avatar do Mestre, nome na cor dele, fonte normal) e fundo levemente mais escuro. Desligado, o comportamento nativo continua intocado: token selecionado fala. `/n texto` faz uma narração pontual sem trocar o modo. Nome do narrador configurável ("Sistema", "Cardinal"…).
  `= texto =`: mensagem que começa e termina com `=` sai como narração, só para o Mestre, como o `/n`. Aprovado em 21/09/2026 e entregue na 0.11.0, junto com o cartão atual, que até então tinha fundo escuro e fonte serifada.
  Implementado no hook `chatMessage`, como o Cautious Gamemaster's Pack faz; um modo custom em `CONFIG.ChatMessage.modes` foi descartado porque ficaria gravado em `core.messageMode` e quebraria o chat se o módulo fosse desativado.
  Sobreposição: Narrator Tools (`/narrate`, overlay), CGMP (`/desc`). O interruptor persistente integrado ao seletor de modo é nosso.

- [x] **C1. Retrabalho visual do chat (tema TBG)** — **M/G**
  Cartões estilo mensageiro: retrato redondo do ator/token à esquerda, nome com a cor do jogador, hora só no hover, **mensagens consecutivas do mesmo falante agrupadas** (sem repetir cabeçalho), rolagens compactas, cores distintas por tipo (falar / OOC / sussurro / narração / ação). Tema alternativo **pixel/retrô** opcional. Tudo via `renderChatMessageHTML` + CSS na layer `modules` do v13+, sem brigar com o core.
  Sobreposição: Chat Portrait (parado no v13), Chat Card Backgrounds (v14, só cores), Yuuko's Chat Overhaul (v14, estilo japonês).

## Fase 2 — Presença e Mestre

- [x] **A5. "Digitando…" sobre o token** — **P/M**
  Enquanto alguém digita no chat, um balãozinho com três pontinhos animados aparece sobre o token dele (e uma linha discreta na sidebar). Socket `module.tbg` com throttle de 250 ms e timeout de 5 s (técnica do CGMP, que já funciona no input ProseMirror do v14).
  Sobreposição: só versões na sidebar (Player Status, CGMP, Yuuko). Sobre o token: nenhuma.

- [x] **B8. Balão do narrador** — **M**
  Toda narração do Mestre (Modo Narrador, `/n` ou `= texto =`), além do cartão no chat, aparece para todos num balão na faixa do topo da tela, com o mesmo formato e tamanho dos balões dos jogadores (quadradinho do retrato, `**Nome:** texto` na mesma linha, borda fina, rabinho), mas com fundo preto, letras brancas e um pergaminho branco no quadradinho do retrato. Desde a 0.16.0 nasce no meio da faixa dos balões, na mesma linha dos outros, e colide com todos; pula mais devagar que eles, para ficar pelo menos 30 segundos quando nada o empurra (pedido de 02/11/2026, na 0.15.0, quando ainda nascia um pouco acima do centro da tela). Como os balões dos jogadores, fica numa linha só, crescendo por igual para os dois lados. Funciona sem cena ativa. Diferente da B2 (`/cena`, cutscene), que segue pendente. Até a 0.10.0 era um letreiro grande, com cartão escuro e borda dourada; o visual de balão foi aprovado em 21/09/2026 e entregue na 0.11.0.
  Sobreposição: Narrator Tools (overlay de narração com estado compartilhado por setting).

- [x] **A9. Balão de uso da ficha** — **M**
  Quando alguém usa um item, uma característica ou uma rolagem da ficha, em qualquer sistema, aparece sobre o token um balão bege, na cor do balão de ação, com o ícone do item: "Kirito usou Espada Longa" ou "Kirito rolou Percepção". Só o nome da ação, nunca o resultado nem a fórmula (a D2 continua vetada). Um uso que gera várias mensagens (cartão, ataque, dano) mostra um balão só; rolagens privadas e cegas seguem a visibilidade do cartão.
  Sobreposição: Token Says e Automated Animations detectam item por sistema; aqui a detecção é genérica.

- [ ] **B4. "Diretor de cena": fazer qualquer token falar** — **P/M**
  Botão direito no token → "Falar como…" abre um mini-input flutuante ao lado do token; ou `/say @Nome texto`. Inclui `/anuncio texto`: balão-megafone que aparece para todos os tokens da cena, estilo intercomunicador de hospital ou de delegacia.
  Sobreposição: nenhuma direta.

- [ ] **B3. Paleta de falantes do Mestre** — **M**
  Barra com retratos dos NPCs recentes/favoritos acima do input. Clique = a próxima mensagem sai como aquele ator, mesmo sem token na cena (`/as Nome` faz o mesmo por texto). Se o ator tiver token na cena, o balão aparece nele. Lembra o último falante entre sessões. Precisa acompanhar o hook `renderChatInput`, porque o input do v14 é re-parentado entre sidebar, popout e overlay de notificações.
  Sobreposição: Speak As, Character Chat Selector (v14). Diferencial: integração com os balões.

- [ ] **C6. Editar e apagar a própria mensagem** — **P/M**
  Lápis no hover (ou seta ↑ com o input vazio edita a última); marca "(editado)"; o balão no canvas atualiza junto. Apagar com confirmação; o Mestre apaga qualquer uma.
  Sobreposição: Character Chat Selector (v14, embutido), Chat Edit (v12).

- [ ] **B7. IC/OOC controlado pelo Mestre** — **P**
  Opções: forçar jogador a falar em personagem quando tem token selecionado e fora de personagem quando não tem; mostrar nome e cor do jogador nas mensagens OOC; bloquear o Mestre de falar como PC por engano; botão de canal rápido IC/OOC ao lado do input.
  **Recomendação:** o Cautious Gamemaster's Pack (v14, ativo) já faz quase tudo. O TBG garante compatibilidade e embute só o botão de canal.
  Parte entregue na 0.15.0 (01/11/2026), a pedido: antes de o Mestre falar pelo token de um personagem de jogador, a barra pergunta.

## Fase 3 — Conforto

- [x] **A8. Histórico de balões da cena** — **M**
  Janela aberta por um botão na barra de ferramentas dos tokens (na Eternia, logo abaixo do Mercado) com tudo que foi "dito" na cena que se está vendo: hora, retrato, nome, o tipo (sussurro, pensamento, fora do personagem) e a fala, ao vivo e descendo sozinha. Clicar numa linha centra o canvas no token. Ao ativar outra cena, o histórico dos jogadores recomeça; o do Mestre guarda tudo, mostra todas as cenas e se exporta em JSON (pedido do usuário). Entregue na 0.14.0 (01/11/2026), com a conversa apagada a cada troca de cena; desde a 0.15.0 nada é apagado. Filtro, busca e replay seguem como ideias.
  Sobreposição: Scene Specific Messages (v12, só filtro).

- [ ] **C7. Responder / citar** — **P/M**
  Botão "↩ Responder" numa mensagem: a nova mensagem mostra um trecho citado com link que rola até a original (`flags.tbg.replyTo`). Muito útil em texto-RP com várias conversas paralelas.
  Sobreposição: nenhuma.

- [ ] **C9. Busca e "pular para não lida"** — **P/M**
  Campo de busca no chat (texto ou falante) e botão "⬇ N novas" quando você rolou para cima e chegaram mensagens.
  Sobreposição: Yuuko (busca).

- [x] **D7. Modo "sem chat aberto"** — **P/M**
  A barra de conversa no pé da tela, acima da barra de macros ou do que tomou o lugar dela, é o único lugar onde se digita (Enter leva o cursor até ela, Enter fala, Shift+Enter grita, Esc sai, as setas repetem as últimas falas). O campo do chat lateral some, e o chat lateral fica só com rolagens e cartões. O Mestre sem token narra, no meio da faixa dos balões; o retrato da barra mostra quem fala e liga o Modo Narrador. Entregue na 0.14.0 (01/11/2026).
  Sobreposição: Sleek Chat (v13, parcial).

- [ ] **C10. Exportar a sessão como "diário"** — **P/M**
  Exportar o log em personagem (com ou sem OOC e rolagens) em HTML ou Markdown, por sessão ou cena, com nomes e retratos, para guardar a história da campanha.
  Sobreposição: DF Chat Enhancements (v12), MRKB (v13).

## Fase 4 — Avançado e integrações

- [ ] **C4. Menções `@jogador` / `@personagem`** — **M/G**
  Digitar `@` abre autocomplete (jogadores e personagens); a mensagem destaca a menção e o mencionado recebe ping e um badge. Exige plugin ProseMirror (`ChatLog#_onConfigurePlugins`), porque o input do v14 não é mais um `<textarea>`.
  Sobreposição: Chat Commander (só `@` para alvo de sussurro).

- [ ] **D3. Salas por Região** — **M**
  Uma Region do Foundry marcada como "Sala TBG": quem está dentro só recebe fala de quem está dentro (taverna, sala de reunião). Destinatários calculados em `preCreateChatMessage` e gravados em `whisper` + `flags.tbg.room`, então quem está fora não recebe nem no log; o Mestre sempre recebe; gritar e narrar ignoram.
  Sobreposição: nenhuma.

- [ ] **B2. Narração em tela (cutscene)** — **M**
  `/cena texto` mostra o texto grande centralizado sobre o canvas para todos, com fade, opcionalmente escurecendo a cena e pausando balões.
  **Recomendação:** o Narrator Tools já faz isso e está ativo no v14. Se instalado, `/cena` delega a ele; versão própria só se o visual precisar ser diferente.

- [ ] ~~**C2. Abas ON / OFF / ROLL**~~ — **M** — *retirada na 0.14.0 a pedido do usuário (01/11/2026): o chat lateral ficou só com rolagens e a conversa foi para a barra e o histórico (D7, A8); o TBG pergunta uma vez ao Mestre se pode desligar as abas do Custom Chat Tabs.*
  Sem reimplementar abas: com o Custom Chat Tabs ativo, o TBG registra pela API dele as abas **ON** (em personagem e narração), **OFF** (fora do personagem) e **ROLL** (rolagens e cartões da ficha), que juntas cobrem toda mensagem, abre o chat no ON e esconde as abas All, IC, OOC e Rolls dele (pedido do usuário). Setting `chatTabs` desliga e devolve as abas originais. A aba ativa filtra só o histórico: a notificação do canto da tela mostra toda mensagem nova. Com o *Enable Chat Tabs* do Custom Chat Tabs desligado, o Mestre recebe um aviso para ligá-lo.

---

- [x] **D8. Guia do jogador no diário** — **M**
  Botão nas configurações do TBG (só Mestre) que cria no mundo o diário "Guia do TBG": tutorial de como jogar por texto, uma página por função (falar, modos de fala, balões, digitando, ações da ficha, abas, boas práticas), com balões de exemplo desenhados com o próprio CSS do módulo. As páginas do Mestre (narração e configurações) ficam ocultas para os jogadores. Clicar de novo troca as páginas pela versão atual, mantendo pasta e permissões. Conteúdo só em pt-BR, por decisão do usuário.

## Vetadas (registro, para não voltarem sem decisão nova)

| Código | Ideia |
|---|---|
| A2 | Estilos e cores de balão por ator (skins, fonte, tag de cargo, cor inline) |
| A4 | Alcance de audição por distância (chat por proximidade) |
| A6 | Máquina de escrever + "voz" (blips) |
| A7 | Emotes, placas e "zzz" |
| B5 | Falas ambientais automáticas (bots) |
| B6 | Gatilhos de fala (falas disparadas por eventos) |
| C3 | Reações com emoji nas mensagens |
| C5 | Emoji picker + `:shortcode:` |
| C8 | Sons de chat por tipo |
| D1 | Expressões / humor do personagem |
| D2 | Balão de dado |
| D4 | Foco do Mestre ("olhem aqui") |
| D5 | Compatibilidade com Polyglot nos balões |
| D6 | Status AFK sobre o token |
