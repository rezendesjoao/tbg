# Como testar o TBG

Roteiro manual da Fase 1 (A1 balões, A3 modos de fala, B1 Modo Narrador, C1 tema do chat), mais um script de verificação automática no fim. Marque conforme for passando.

## 1. Preparação

- [ ] Foundry VTT **14** (mínimo exigido pelo manifesto; testado em 14.367).
- [ ] Módulo ativo em *Game Settings → Manage Modules → TBG*.
- [ ] Console do navegador (F12) mostra `TBG | TBG 0.5.0 pronto` e nenhum erro em vermelho.
- [ ] **Opção do core ligada**: *Configure Settings → Core → Enable Chat Bubbles*. Ela é por cliente e o TBG a respeita: desligada, nenhum balão aparece. Esta é a causa mais comum de "não funciona".
- [ ] Uma cena aberta com **pelo menos dois tokens** de atores diferentes, afastados um do outro (uns dois terços da largura da tela). Eles são necessários para testar as colunas independentes.
- [ ] Zoom de forma que os dois tokens apareçam com espaço livre acima deles.

Se algo falhar aqui, pare: o resto do roteiro depende disso.

## 2. A1 — Motor de balões

- [ ] **Balão simples.** Selecione um token e mande `Olá`. Um balão branco aparece acima dele, com o nome em negrito, dois-pontos e o texto.
- [ ] **Cabeçalho.** Dentro do balão, a imagem do token e o nome ficam lado a lado na primeira linha, e a fala vem embaixo. Teste com um personagem de nome longo: o nome quebra em duas linhas mas nunca desce para baixo da imagem.
- [ ] **Retrato.** Desligue *Retrato no balão* nas configurações e confirme que a imagem some e o nome continua no lugar.
- [ ] **Empilhamento.** Mande mais duas mensagens seguidas. Os balões antigos sobem e o novo nasce embaixo, colado no token. Nenhum deles se sobrepõe.
- [ ] **Subida contínua.** Pare de escrever e observe. Os balões sobem sozinhos e desaparecem ao passar do limite. O movimento deve ser fluido, sem tranco. Ajuste *Velocidade de subida* ao gosto da mesa.
- [ ] **Acompanha o token.** Com balões na tela, arraste o token para o outro lado da cena. Os balões vão junto, mantendo a pilha.
- [ ] **Zoom.** Dê zoom para dentro e para fora. Com *Escala dos balões* em "Fixa na tela", o balão mantém o mesmo tamanho de leitura em qualquer zoom. Troque para "Junto com o mapa" e confirme que passa a encolher e crescer com a cena.
- [ ] **Colunas independentes (free flow).** Selecione o segundo token, distante, e mande uma mensagem. O balão dele aparece na coluna dele e **não** empurra os balões do primeiro token.
- [ ] **Linha a linha.** Troque *Empilhamento dos balões* para "Linha a linha" e repita o passo anterior. Agora a mensagem de um token empurra os balões do outro também. Volte para "Free flow" depois.
- [ ] **Edição.** Edite o conteúdo de uma mensagem que ainda tem balão na tela. O texto do balão muda junto.
- [ ] **Interruptor geral.** Desligue *Ativar TBG*. Os balões somem e novas mensagens não geram balão. Ligue de novo.

## 3. A3 — Modos de fala

Sempre com um token selecionado.

| Teste | O que digitar | O que deve acontecer |
|---|---|---|
| Fala | `Bom dia` | Balão normal; no chat, cartão em personagem |
| Grito por comando | `/shout ACORDEM` | Balão maior, texto em negrito |
| Grito por teclado | `ACORDEM` + **Shift+Enter** | Igual ao anterior, sem digitar comando |
| Pensar | `/think será?` | Balão pontilhado arredondado; só o Mestre e o dono veem |
| Ação por asterisco | `*saca a espada*` | Balão em itálico com só "saca a espada", sem o nome antes |
| Ação por comando | `/me ajeita o casaco` | Igual ao anterior, e no cartão do chat o nome aparece uma vez só, no cabeçalho |
| Sussurro | `/w Nome oi` | Balão tracejado cinza, só para quem recebe |
| Fala explícita | `/say olá` | Balão normal mesmo com outro modo de mensagem ativo |
| Fora do personagem | `/ooc já volto` | Mensagem fora do personagem no chat e balão acinzentado e translúcido sobre o token |

- [ ] Todos os nove casos acima.
- [ ] **Sem token.** Deselecione tudo e mande `teste`. A mensagem sai fora de personagem, sem balão, e nada quebra.
- [ ] **Sem token, em personagem.** Ainda sem token, tente `/think algo`. Aparece um aviso pedindo para selecionar um token.
- [ ] **Comandos do core intactos.** `/roll 1d20` rola normalmente e **não** vira balão.

## 4. B1 — Modo Narrador

- [ ] **Botão.** Ao lado dos ícones de modo de mensagem (embaixo do chat) existe um botão de pergaminho.
- [ ] **Ligar.** Clique nele. Aparece a notificação "Modo Narrador ligado" e o botão fica marcado como pressionado.
- [ ] **Narrar.** Com um token ainda selecionado, digite `O vento uiva na floresta`. A mensagem sai como **Narrador**, num cartão escuro com fonte serifada, e **não** gera balão, mesmo com o token selecionado.
- [ ] **Comandos passam.** Ainda em Modo Narrador, `/roll 1d20` continua rolando dado normalmente.
- [ ] **Desligar.** Clique de novo. Notificação "Modo Narrador desligado" e o token volta a falar.
- [ ] **Atalho.** Repita ligando e desligando com **Alt+N**.
- [ ] **Narração pontual.** Com o modo desligado, mande `/n A porta range`. Sai como Narrador sem trocar o modo.
- [ ] **Nome.** Mude *Nome do narrador* nas configurações para algo como `Cardinal` e confirme que as narrações passam a usar esse nome.
- [ ] **Só Mestre.** Num cliente de jogador, o botão de pergaminho não aparece e `/n` é recusado.

## 4b. Contador de caracteres e digitação

- [ ] **Contador.** Ao lado dos ícones de modo de mensagem aparece `0/150`. Ele sobe conforme você digita. O teto é fixo: não existe configuração para mudá-lo e ele é o mesmo em qualquer mundo.
- [ ] **Legibilidade.** O contador é branco com contorno preto e continua legível sobre fundo claro e escuro.
- [ ] **Aviso.** Até a metade do limite ele fica branco; da metade em diante vai ficando vermelho, chegando a vermelho pleno no limite.
- [ ] **Bloqueio.** No limite, o editor para de aceitar novas letras. Colar um texto maior que o limite também é recusado.
- [ ] **Apagar sempre funciona.** Mesmo com o campo cheio, apagar letra a letra e selecionar tudo e apagar continuam funcionando.
- [ ] **Digitando.** Com dois clientes, um deles começa a escrever com o token selecionado: no outro cliente aparecem três pontinhos animados sobre aquele token.
- [ ] **Some ao enviar.** Ao enviar a mensagem, os pontinhos somem e viram o balão da fala.
- [ ] **Some ao apagar.** Apague tudo que digitou sem enviar: os pontinhos somem no outro cliente.

## 5. C1 — Tema do chat

- [ ] **Retrato.** Cada cartão do chat tem a imagem do falante, uma só vez. Se o sistema de jogo já desenha um avatar (o dnd5e faz isso), o TBG não acrescenta outro.
- [ ] **Cor.** O nome aparece na cor do jogador que escreveu.
- [ ] **Agrupamento.** Duas mensagens seguidas do mesmo falante: a segunda não repete o cabeçalho e encosta na primeira.
- [ ] **Quebra do agrupamento.** Uma mensagem de outro falante no meio faz o cabeçalho voltar.
- [ ] **Tipos distintos.** Grito em negrito, pensamento em itálico com balãozinho, ação em itálico, narração no cartão escuro.
- [ ] **Desligar.** Desligue *Tema do chat* e confirme que os cartões voltam ao visual padrão do Foundry, sem quebrar nada.

## 6. Com mais de um cliente

O teste que mais importa, porque balão é coisa de mesa. Abra uma janela anônima do navegador e entre como jogador, com o Mestre na janela normal.

- [ ] **Todos veem.** Uma fala do Mestre aparece como balão nas duas telas.
- [ ] **Pensamento é privado.** `/think` do Mestre **não** aparece para o jogador, nem no chat nem como balão.
- [ ] **Sussurro é privado.** `/w Jogador oi` aparece só para o alvo, com balão, e não para terceiros.
- [ ] **Jogador fala.** O jogador seleciona o próprio token e fala: o balão aparece nas duas telas.
- [ ] **Narração.** A narração do Mestre chega ao jogador como cartão, sem balão.
- [ ] **Sem duplicata.** Nenhuma mensagem gera dois balões sobrepostos em nenhuma das telas.

## 7. Verificação automática

Cole no console (F12) do cliente do **Mestre**, com uma cena aberta. O script cria dois atores e tokens de teste, exercita tudo e imprime uma tabela de aprovado e reprovado. Ele apaga os atores, tokens e mensagens que criou, depois de uma pausa: apagar uma mensagem enquanto o Foundry ainda anima a notificação dela faz o core lançar um erro que não tem relação com o TBG.

```js
await (async () => {
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (n, p, d = "") => results.push({ teste: n, ok: p ? "PASSOU" : "FALHOU", detalhe: d });
  const at = el => { const m = new DOMMatrix(el.style.transform); return { x: Math.round(m.m41), y: Math.round(m.m42) }; };
  const rect = el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
  const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const bubbles = id => [...document.querySelectorAll(`#tbg-bubbles .tbg-bubble[data-token-id="${id}"]:not(.tbg-bubble--typing)`)];
  const kindOf = el => [...el.classList].find(c => c.startsWith("tbg-bubble--") && !c.endsWith("visible"))?.slice(12);
  const typing = async (tokenId, on) => { const layer = await import("/modules/tbg/scripts/bubbles/layer.mjs"); await layer.bubbleLayer.setTyping(tokenId, on, "Digitando"); await pause(200); };
  const module = game.modules.get("tbg");

  check("módulo ativo", module?.active === true, module?.version ?? "ausente");
  check("opção do core Enable Chat Bubbles", game.settings.get("core", "chatBubbles") === true);
  check("container no HUD", !!document.getElementById("tbg-bubbles"));
  check("comandos registrados", Object.keys(foundry.applications.sidebar.tabs.ChatLog.CHAT_COMMANDS).filter(k => k.startsWith("tbg")).length === 5);
  check("botão do Narrador", !!document.querySelector("#message-modes [data-tbg-narrator]"));
  check("atalho registrado", game.keybindings.actions.has("tbg.toggleNarrator"));
  check("contador de caracteres", !!document.querySelector(".tbg-char-count"));

  const firstMessage = game.messages.size;
  const type = Object.keys(game.system.documentTypes.Actor)[0];
  const actors = await Actor.createDocuments([{ name: "TBG Teste A", type }, { name: "TBG Teste B", type }]);
  const docs = await Promise.all(actors.map((a, i) => a.getTokenDocument({ x: 400 + i * 1600, y: 800 })));
  const tokens = await canvas.scene.createEmbeddedDocuments("Token", docs.map(d => d.toObject()));
  await pause(800);
  const [tokenA, tokenB] = tokens.map(t => canvas.tokens.get(t.id));
  const say = async t => { await ui.chat.processMessage(t); await pause(300); };

  tokenA.control({ releaseOthers: true });
  await say("Primeira."); await say("Segunda."); await say("Terceira.");
  await pause(400);

  const stack = bubbles(tokenA.id);
  check("três balões, sem duplicata", stack.length === 3, `${stack.length} na tela`);
  const boxes = stack.map(rect);
  let colisoes = 0;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (overlap(boxes[i], boxes[j])) colisoes++;
  check("nenhuma sobreposição", colisoes === 0, `${colisoes} colisões`);

  const before = bubbles(tokenA.id).map(b => at(b).x);
  await tokenA.document.update({ x: tokenA.document.x + 400 }, { animate: false });
  await pause(600);
  check("balões acompanham o token", bubbles(tokenA.id).map(b => at(b).x).every((v, i) => Math.abs(v - before[i] - 400) < 5));

  const subida = game.settings.get("tbg", "bubbleRiseSpeed");
  await game.settings.set("tbg", "bubbleRiseSpeed", 0);
  const antes = bubbles(tokenA.id).map(b => at(b).y);
  tokenB.control({ releaseOthers: true });
  await say("Coluna separada.");
  await pause(400);
  check("colunas independentes (free flow)", JSON.stringify(antes) === JSON.stringify(bubbles(tokenA.id).map(b => at(b).y)));
  await game.settings.set("tbg", "bubbleRiseSpeed", subida);

  tokenA.control({ releaseOthers: true });
  for (const [text, esperado] of [["/shout GRITO", "shout"], ["/think penso", "think"], ["*age*", "action"], ["/me gesticula", "action"], ["/say falo", "say"], ["/ooc fora do personagem", "ooc"]]) {
    await say(text);
    const last = game.messages.contents.at(-1);
    const b = document.querySelector(`#tbg-bubbles .tbg-bubble[data-message-id="${last.id}"]`);
    check(`comando ${text.split(" ")[0]}`, kindOf(b ?? document.createElement("div")) === esperado, b ? kindOf(b) : "nenhum balão");
  }

  const acao = game.messages.contents.findLast(m => m.getFlag("tbg", "kind") === "action");
  const acaoTexto = document.querySelector(`#tbg-bubbles .tbg-bubble[data-message-id="${acao.id}"] .tbg-bubble__text`)?.textContent.trim();
  check("ação sem o nome antes", !acao.content.startsWith(`${acao.alias} `) && !acaoTexto?.startsWith(acao.alias), acaoTexto);

  const contador = document.querySelector(".tbg-char-count");
  const contorno = getComputedStyle(contador).getPropertyValue("-webkit-text-stroke");
  check("contador com contorno preto", contorno.includes("rgb(0, 0, 0)"), contorno);

  const ooc = game.messages.contents.at(-1);
  check("/ooc continua fora do personagem", ooc.style === CONST.CHAT_MESSAGE_STYLES.OOC);
  const oocCard = ui.chat.element.querySelector(`[data-message-id="${ooc.id}"]`);
  const visiveis = [...oocCard.querySelectorAll("img")].filter(i => getComputedStyle(i).display !== "none");
  check("sem retrato duplicado no chat", visiveis.length <= 1, `${visiveis.length} de ${oocCard.querySelectorAll("img").length}`);

  const balao = bubbles(tokenA.id).find(b => b.querySelector(".tbg-bubble__portrait"));
  if (balao) {
    const p = rect(balao.querySelector(".tbg-bubble__portrait"));
    const n = rect(balao.querySelector(".tbg-bubble__name"));
    const t = rect(balao.querySelector(".tbg-bubble__text"));
    check("nome ao lado do retrato", n.l >= p.r - 1 && n.t < p.b && n.b > p.t);
    check("texto abaixo do cabeçalho", t.t >= p.b - 2);
  }

  await say("/n A neblina desce.");
  const narration = game.messages.contents.at(-1);
  check("narração sem balão", narration.getFlag("tbg", "kind") === "narration" && !document.querySelector(`#tbg-bubbles .tbg-bubble[data-message-id="${narration.id}"]`), narration.alias);
  check("tema aplicado ao cartão", ui.chat.element.querySelector(`[data-message-id="${narration.id}"]`)?.classList.contains("tbg-kind-narration") === true);
  check("balão do core silenciado", document.querySelectorAll("#chat-bubbles .chat-bubble").length === 0);

  await typing(tokenA.id, true);
  check("indicador de digitação", !!document.querySelector(`#tbg-bubbles .tbg-bubble--typing[data-token-id="${tokenA.id}"]`));
  await typing(tokenA.id, false);
  check("indicador some ao parar", !document.querySelector(".tbg-bubble--typing"));

  await pause(1500);
  await canvas.scene.deleteEmbeddedDocuments("Token", tokens.map(t => t.id));
  await Actor.deleteDocuments(actors.map(a => a.id));
  await ChatMessage.deleteDocuments(game.messages.contents.slice(firstMessage).map(m => m.id));
  await pause(600);
  const orfaos = document.querySelectorAll("#tbg-bubbles .tbg-bubble").length;
  check("nenhum balão órfão no fim", orfaos === 0, `${orfaos} restaram`);

  console.table(results);
  const failed = results.filter(r => r.ok === "FALHOU");
  console.log(failed.length ? `${failed.length} teste(s) falharam` : `Todos os ${results.length} testes passaram.`);
  return results;
})();
```

O script não cobre o que depende de olho humano ou de um segundo cliente: aparência dos balões, subida contínua, zoom, agrupamento no chat e os testes da seção 6. Faça esses à mão.

## 8. Ao reportar um problema

Abra uma [issue](https://github.com/rezendesjoao/tbg/issues) com a versão do Foundry, a versão do TBG, o sistema de jogo, os outros módulos ativos, o que você fez, o que esperava e o que aconteceu, mais qualquer erro em vermelho do console (F12). A saída do script da seção 7 ajuda bastante.
