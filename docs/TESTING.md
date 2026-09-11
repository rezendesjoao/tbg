# Como testar o TBG

Roteiro manual da Fase 1 (A1 balões, A3 modos de fala, B1 Modo Narrador, C1 tema do chat), mais um script de verificação automática no fim. Marque conforme for passando.

## 1. Preparação

- [ ] Foundry VTT **14** (mínimo exigido pelo manifesto; testado em 14.367).
- [ ] Módulo ativo em *Game Settings → Manage Modules → TBG*.
- [ ] Console do navegador (F12) mostra `TBG | TBG 0.2.1 pronto` e nenhum erro em vermelho.
- [ ] **Opção do core ligada**: *Configure Settings → Core → Enable Chat Bubbles*. Ela é por cliente e o TBG a respeita: desligada, nenhum balão aparece. Esta é a causa mais comum de "não funciona".
- [ ] Uma cena aberta com **pelo menos dois tokens** de atores diferentes, afastados um do outro (uns dois terços da largura da tela). Eles são necessários para testar as colunas independentes.
- [ ] Zoom de forma que os dois tokens apareçam com espaço livre acima deles.

Se algo falhar aqui, pare: o resto do roteiro depende disso.

## 2. A1 — Motor de balões

- [ ] **Balão simples.** Selecione um token e mande `Olá`. Um balão branco aparece acima dele, com o nome em negrito, dois-pontos e o texto.
- [ ] **Retrato.** O balão mostra a imagem do token em círculo à esquerda do nome. Desligue *Retrato no balão* nas configurações e confirme que some.
- [ ] **Empilhamento.** Mande mais duas mensagens seguidas. Os balões antigos sobem e o novo nasce embaixo, colado no token. Nenhum deles se sobrepõe.
- [ ] **Subida contínua.** Pare de escrever e observe. Os balões sobem devagar sozinhos e desaparecem ao passar do limite. Aumente *Velocidade de subida* para ver mais rápido.
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
| Ação por asterisco | `*saca a espada*` | Balão em itálico, sem "Nome:", frase começando pelo nome |
| Ação por comando | `/me ajeita o casaco` | Igual ao anterior |
| Sussurro | `/w Nome oi` | Balão tracejado cinza, só para quem recebe |
| Fala explícita | `/say olá` | Balão normal mesmo com outro modo de mensagem ativo |

- [ ] Todos os oito casos acima.
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

## 5. C1 — Tema do chat

- [ ] **Retrato.** Cada cartão do chat tem a imagem do falante em círculo à esquerda.
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

Cole no console (F12) do cliente do **Mestre**, com uma cena aberta. O script cria dois atores e tokens de teste, exercita tudo e imprime uma tabela de aprovado e reprovado. Ele apaga os atores, tokens e mensagens que criou.

```js
await (async () => {
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (name, pass, detail = "") => results.push({ teste: name, ok: pass ? "PASSOU" : "FALHOU", detalhe: detail });
  const bubbles = id => [...document.querySelectorAll(`#tbg-bubbles .tbg-bubble[data-token-id="${id}"]`)];
  const kindOf = el => [...el.classList].find(c => c.startsWith("tbg-bubble--") && !c.endsWith("visible"))?.slice(12);
  const module = game.modules.get("tbg");

  check("módulo ativo", module?.active === true, module?.version ?? "ausente");
  check("opção do core Enable Chat Bubbles", game.settings.get("core", "chatBubbles") === true);
  check("container no HUD", !!document.getElementById("tbg-bubbles"));
  check("comandos registrados", Object.keys(foundry.applications.sidebar.tabs.ChatLog.CHAT_COMMANDS).filter(k => k.startsWith("tbg")).length === 5);
  check("botão do Narrador", !!document.querySelector("#message-modes [data-tbg-narrator]"));
  check("atalho registrado", game.keybindings.actions.has("tbg.toggleNarrator"));

  const firstMessage = game.messages.size;
  const actors = await Actor.createDocuments([{ name: "TBG Teste A", type: Object.keys(game.system.documentTypes.Actor)[0] },
                                              { name: "TBG Teste B", type: Object.keys(game.system.documentTypes.Actor)[0] }]);
  const docs = await Promise.all(actors.map((a, i) => a.getTokenDocument({ x: 400 + i * 1600, y: 800 })));
  const tokens = await canvas.scene.createEmbeddedDocuments("Token", docs.map(d => d.toObject()));
  await pause(800);
  const [tokenA, tokenB] = tokens.map(t => canvas.tokens.get(t.id));

  const say = async text => { await ui.chat.processMessage(text); await pause(300); };
  tokenA.control({ releaseOthers: true });
  await say("Primeira.");
  await say("Segunda.");
  await say("Terceira.");
  await pause(400);

  const stack = bubbles(tokenA.id);
  check("três balões simultâneos", stack.length === 3, `${stack.length} na tela`);
  const tops = stack.map(b => parseFloat(b.style.top));
  check("balões empilhados sem sobrepor", new Set(tops.map(Math.round)).size === 3, tops.map(Math.round).join(", "));

  const before = bubbles(tokenA.id).map(b => parseFloat(b.style.left));
  await tokenA.document.update({ x: tokenA.document.x + 400 }, { animate: false });
  await pause(600);
  const after = bubbles(tokenA.id).map(b => parseFloat(b.style.left));
  check("balões acompanham o token", after.every((v, i) => Math.abs(v - before[i] - 400) < 5), `${Math.round(before[0])} → ${Math.round(after[0])}`);

  const topsBefore = bubbles(tokenA.id).map(b => Math.round(parseFloat(b.style.top)));
  tokenB.control({ releaseOthers: true });
  await say("Coluna separada.");
  await pause(400);
  const topsAfter = bubbles(tokenA.id).map(b => Math.round(parseFloat(b.style.top)));
  check("colunas independentes (free flow)", JSON.stringify(topsBefore) === JSON.stringify(topsAfter), "token distante não empurrou");

  tokenA.control({ releaseOthers: true });
  const cases = [["/shout GRITO", "shout"], ["/think penso", "think"], ["*age*", "action"], ["/me gesticula", "action"], ["/say falo", "say"]];
  for (const [text, expected] of cases) {
    await say(text);
    const last = game.messages.contents.at(-1);
    const bubble = document.querySelector(`#tbg-bubbles .tbg-bubble[data-message-id="${last.id}"]`);
    check(`comando ${text.split(" ")[0]}`, kindOf(bubble ?? document.createElement("div")) === expected, `esperado ${expected}, veio ${bubble ? kindOf(bubble) : "nenhum balão"}`);
  }

  const think = game.messages.contents.find(m => m.getFlag("tbg", "kind") === "think");
  check("pensamento é privado", think?.whisper.length > 0, `${think?.whisper.length ?? 0} destinatários`);

  await say("/n A neblina desce.");
  const narration = game.messages.contents.at(-1);
  check("narração sem balão", narration.getFlag("tbg", "kind") === "narration" && !document.querySelector(`#tbg-bubbles .tbg-bubble[data-message-id="${narration.id}"]`), narration.alias);

  const card = ui.chat.element.querySelector(`[data-message-id="${narration.id}"]`);
  check("tema aplicado ao cartão", card?.classList.contains("tbg-kind-narration") === true);
  check("balão do core silenciado", document.querySelectorAll("#chat-bubbles .chat-bubble").length === 0);

  await canvas.scene.deleteEmbeddedDocuments("Token", tokens.map(t => t.id));
  await Actor.deleteDocuments(actors.map(a => a.id));
  await ChatMessage.deleteDocuments(game.messages.contents.slice(firstMessage).map(m => m.id));

  console.table(results);
  const failed = results.filter(r => r.ok === "FALHOU");
  console.log(failed.length ? `${failed.length} teste(s) falharam` : `Todos os ${results.length} testes passaram.`);
  return results;
})();
```

O script não cobre o que depende de olho humano ou de um segundo cliente: aparência dos balões, subida contínua, zoom, agrupamento no chat e os testes da seção 6. Faça esses à mão.

## 8. Ao reportar um problema

Abra uma [issue](https://github.com/rezendesjoao/tbg/issues) com a versão do Foundry, a versão do TBG, o sistema de jogo, os outros módulos ativos, o que você fez, o que esperava e o que aconteceu, mais qualquer erro em vermelho do console (F12). A saída do script da seção 7 ajuda bastante.
