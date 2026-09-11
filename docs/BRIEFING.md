# TBG — Briefing de funcionalidades

**Aprovado em 11/09/2026.** Marque `[x]` quando um item for entregue. A fase indica a ordem de implementação. Esforço: **P** horas · **M** 1–3 dias · **G** semana ou mais. "Sobreposição" cita módulos existentes parecidos (para integrar, não copiar).

Os códigos (A1, B3…) são a forma de se referir a cada ideia em issues, commits e conversas.

---

## Fase 1 — Núcleo Habbo

- [ ] **A1. Motor de balões "free flow"** — **G** — *o coração do módulo*
  Camada HTML própria dentro do HUD do canvas que substitui os balões do core (cancelados via hook `chatBubbleHTML`). Toda mensagem em personagem com token na cena vira um balão `**Nome:** texto` acima do token, com um único visual padrão (branco, rabinho para baixo, estilo Habbo clássico). Balões **empilham**: o novo nasce na base e empurra os anteriores para cima em 200 ms; um relógio sobe todos devagar; quem cruza o topo da faixa esvanece e some. Vários balões por token e por cena. Os balões **seguem o token** e acompanham pan/zoom (com opção "tamanho fixo na tela" para não virarem formiga ao afastar). Modos "free flow" (o novo só empurra quem ele sobrepõe, formando colunas por grupo de conversa) e "linha a linha" (empurra todos). Configurações do Mestre: velocidade de subida, largura máxima, altura da faixa, tempo mínimo em tela. Editar a mensagem atualiza o balão.
  Sobreposição: nenhuma mantida (o único módulo de duração morreu no v10).

- [ ] **A3. Modos de fala** — **M**
  - **Falar** (texto normal ou `/say`): balão normal.
  - **Gritar** (`/shout` ou **Shift+Enter**): negrito, balão maior, ignora qualquer filtro de sala.
  - **Sussurrar** (`/w` nativo): balão itálico cinza só para quem recebe.
  - **Pensar** (`/think` ou `/t`): balão-nuvem visível só para o Mestre e o dono.
  - **Ação** (`/me` nativo ou `*texto*`): balão sem "Nome:", em itálico.
  Implementação: `ChatLog.CHAT_COMMANDS` do v14 + `flags.tbg.kind` na mensagem. `/w` e `/me` já são do core; só reaproveitamos o parse.

- [ ] **B1. Modo Narrador (interruptor)** — **P/M** — *pedido explícito*
  Um **modo de mensagem "Narrador"** registrado em `CONFIG.ChatMessage.modes` (aparece no seletor nativo da sidebar, ícone 📜), mais um atalho de teclado e um botão. Enquanto ativo, o que o Mestre digita sai com alias "Narrador" (sem ator/token, portanto sem balão), estilo OTHER e `flags.tbg.kind = "narration"`, num cartão estilizado (fundo escuro, fonte serifada). Desligado, o comportamento nativo continua intocado: token selecionado fala. `/n texto` faz uma narração pontual sem trocar o modo. Nome do narrador configurável ("Sistema", "Cardinal"…).
  Fallback se o handler do modo não permitir trocar o falante: hook `chatMessage`, como o Cautious Gamemaster's Pack faz.
  Sobreposição: Narrator Tools (`/narrate`, overlay), CGMP (`/desc`). O interruptor persistente integrado ao seletor de modo é nosso.

- [ ] **C1. Retrabalho visual do chat (tema TBG)** — **M/G**
  Cartões estilo mensageiro: retrato redondo do ator/token à esquerda, nome com a cor do jogador, hora só no hover, **mensagens consecutivas do mesmo falante agrupadas** (sem repetir cabeçalho), rolagens compactas, cores distintas por tipo (falar / OOC / sussurro / narração / ação). Tema alternativo **pixel/retrô** opcional. Tudo via `renderChatMessageHTML` + CSS na layer `modules` do v13+, sem brigar com o core.
  Sobreposição: Chat Portrait (parado no v13), Chat Card Backgrounds (v14, só cores), Yuuko's Chat Overhaul (v14, estilo japonês).

## Fase 2 — Presença e Mestre

- [ ] **A5. "Digitando…" sobre o token** — **P/M**
  Enquanto alguém digita no chat, um balãozinho com três pontinhos animados aparece sobre o token dele (e uma linha discreta na sidebar). Socket `module.tbg` com throttle de 250 ms e timeout de 5 s (técnica do CGMP, que já funciona no input ProseMirror do v14).
  Sobreposição: só versões na sidebar (Player Status, CGMP, Yuuko). Sobre o token: nenhuma.

- [ ] **B4. "Diretor de cena": fazer qualquer token falar** — **P/M**
  Botão direito no token → "Falar como…" abre um mini-input flutuante ao lado do token; ou `/say @Nome texto`. Inclui `/anuncio texto`: balão-megafone que aparece para todos os tokens da cena, estilo intercomunicador de hospital/polícia dos RPGs de Habbo.
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

## Fase 3 — Conforto

- [ ] **A8. Histórico de balões da cena** — **M**
  Painel lateral (botão `>`, como no Habbo) com tudo que foi "dito" na cena atual: retrato, filtro por token e por modo, busca. Clicar numa linha centra o canvas no token e re-mostra o balão por alguns segundos. Opcional: "replay" acelerado dos últimos minutos, para recapitular.
  Sobreposição: Scene Specific Messages (v12, só filtro).

- [ ] **C7. Responder / citar** — **P/M**
  Botão "↩ Responder" numa mensagem: a nova mensagem mostra um trecho citado com link que rola até a original (`flags.tbg.replyTo`). Muito útil em texto-RP com várias conversas paralelas.
  Sobreposição: nenhuma.

- [ ] **C9. Busca e "pular para não lida"** — **P/M**
  Campo de busca no chat (texto ou falante) e botão "⬇ N novas" quando você rolou para cima e chegaram mensagens.
  Sobreposição: Yuuko (busca).

- [ ] **D7. Modo "sem chat aberto"** — **P/M**
  Para quem joga com a sidebar recolhida: um input flutuante minimalista embaixo do canvas (Enter abre) para falar sem abrir a sidebar. O jogo vira "só canvas + balões", como no Habbo.
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

- [ ] **C2. Abas IC / OOC / Rolagens / Sussurros** — **M**
  **Recomendação:** não reimplementar. O Custom Chat Tabs (v14, ativo) resolve; o TBG garante que suas `flags` e classes CSS sejam filtráveis por ele.

---

## Vetadas (registro, para não voltarem sem decisão nova)

| Código | Ideia |
|---|---|
| A2 | Estilos e cores de balão por ator (skins, fonte, tag de cargo, cor inline) |
| A4 | Alcance de audição por distância (chat por proximidade) |
| A6 | Máquina de escrever + "voz" (blips) |
| A7 | Emotes, placas e "zzz" |
| B5 | Falas ambientais automáticas (bots) |
| B6 | Gatilhos de fala ("Wired") |
| C3 | Reações com emoji nas mensagens |
| C5 | Emoji picker + `:shortcode:` |
| C8 | Sons de chat por tipo |
| D1 | Expressões / humor do personagem |
| D2 | Balão de dado |
| D4 | Foco do Mestre ("olhem aqui") |
| D5 | Compatibilidade com Polyglot nos balões |
| D6 | Status AFK sobre o token |

## Como o Habbo faz (referência rápida)

Fonte: cliente open-source Nitro, reimplementação fiel do cliente oficial.

- O balão **não some por timer**: nasce na base de uma faixa da tela, centralizado no avatar, e é empurrado para cima quando chega mensagem nova (`transition: top 0.2s ease`). Um relógio sobe todos devagar (rápido/normal/lento, escolhido pelo dono da sala). Some ao sair pelo topo. Tempo de vida = ritmo da conversa.
- **Free Flow Chat**: o balão novo só empurra os que ele sobrepõe geometricamente; grupos distantes formam colunas independentes. Largura máxima: larga / normal (350 px) / fina (240 px).
- Formato `**Nome:** texto`, miniatura da cabeça do avatar dentro do balão, rabinho para baixo.
- Modos: falar (normal), gritar (`:shout` ou Shift+Enter, negrito, sala toda), sussurrar (`:whisper nome`, itálico cinza, só o alvo vê).
- Histórico da sala (botão `>`): balões e histórico são duas visões do mesmo fluxo.
