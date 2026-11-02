# Como testar o TBG

Roteiro manual da Fase 1 (A1 balões, A3 modos de fala, B1 Modo Narrador, C1 tema do chat) e do que veio depois (A5 digitação, B8 balão do narrador, A9 balão de uso da ficha, D7 barra de conversa, A8 histórico da cena), mais um script de verificação automática no fim. Marque conforme for passando.

## 1. Preparação

- [ ] Foundry VTT **14** (mínimo exigido pelo manifesto; testado em 14.367).
- [ ] Módulo ativo em *Game Settings → Manage Modules → TBG*.
- [ ] Console do navegador (F12) mostra `TBG | TBG 0.14.0 pronto` e nenhum erro em vermelho.
- [ ] A barra de conversa aparece no pé da tela, acima da barra de macros (ou do HUD da Eternia), e o campo de digitar do chat lateral não aparece mais.
- [ ] **Opção do core ligada**: *Configure Settings → Core → Enable Chat Bubbles*. Ela é por cliente e o TBG a respeita: desligada, nenhum balão aparece. Esta é a causa mais comum de "não funciona".
- [ ] Uma cena aberta com **pelo menos dois tokens** de atores diferentes, afastados um do outro (uns dois terços da largura da tela). Eles são necessários para testar as colunas independentes.
- [ ] Zoom de forma que os dois tokens apareçam na tela, longe da barra lateral.

Se algo falhar aqui, pare: o resto do roteiro depende disso.

## 2. A1 — Motor de balões

- [ ] **Balão simples.** Selecione um token e mande `Olá` pela barra de conversa. Um balão branco aparece na faixa do topo da tela, na mesma direção do token, com o nome em negrito, dois-pontos e o texto.
- [ ] **Em linha.** Dentro do balão, a imagem do token, o nome em negrito com dois-pontos e a fala ficam na mesma linha.
- [ ] **Linha única.** Mande uma fala de 130 caracteres: o balão não quebra, fica numa linha só, mais comprido, centrado na direção do token e crescendo por igual para os dois lados. Perto da borda da tela, ele se encosta na parte visível, sem entrar embaixo da barra lateral nem da lista de cenas.
- [ ] **Compacto.** A borda é fina e o texto fica colado nela; o retrato aparece num quadradinho escuro encostado na borda esquerda.
- [ ] **Retrato.** Desligue *Retrato no balão* nas configurações e confirme que a imagem some e o nome continua no lugar.
- [ ] **Empilhamento.** Mande mais duas mensagens seguidas. O novo nasce na linha da faixa e os antigos sobem para dar lugar. Nenhum deles se sobrepõe.
- [ ] **Pulos.** Pare de escrever e observe. Os balões ficam parados e, mais ou menos a cada dois segundos no padrão, pulam todos juntos uma linha, num movimento curto e limpo, sem subir no meio do caminho; o recém-nascido espera um instante antes do primeiro pulo. Quem passa do topo da tela some. Ajuste *Velocidade de subida* ao gosto da mesa.
- [ ] **Fica onde foi dito.** Com balões na tela, arraste o token para o outro lado da cena: os balões ficam onde estavam. Arraste o mapa: os balões dos tokens vão junto, só na horizontal, e a linha da faixa não sai do lugar.
- [ ] **Zoom.** Dê zoom para dentro e para fora: o balão mantém o mesmo tamanho de leitura e só muda de lugar na linha; quem encostar em outro sobe, sem sobrepor.
- [ ] **Colunas independentes (free flow).** Selecione o segundo token, distante, e mande uma mensagem. O balão dele aparece na coluna dele e **não** empurra os balões do primeiro token.
- [ ] **Linha a linha.** Troque *Empilhamento dos balões* para "Linha a linha" e repita o passo anterior. Agora a mensagem de um token empurra os balões do outro também. Volte para "Free flow" depois.
- [ ] **Colisão entre todos.** Com dois tokens lado a lado, mande falas dos dois e uma narração no meio: ninguém se sobrepõe, quem encosta sobe.
- [ ] **Altura da faixa.** Troque *Altura da faixa dos balões* para 200: os balões passam a nascer mais perto do topo. Volte para 320.
- [ ] **Interruptor geral.** Desligue *Ativar balões do TBG*. Os balões somem e novas mensagens não geram balão, mas a barra e o histórico continuam. Ligue de novo.

## 3. A3 — Modos de fala

Sempre com um token selecionado, escrevendo na barra de conversa.

| Teste | O que digitar | O que deve acontecer |
|---|---|---|
| Fala | `Bom dia` | Balão normal; no histórico da cena, uma linha em personagem |
| Grito por comando | `/shout ACORDEM` | Balão maior, texto em negrito |
| Grito por teclado | `ACORDEM` + **Shift+Enter** | Igual ao anterior, sem digitar comando |
| Pensar | `/think será?` | Balão pontilhado arredondado; só o Mestre e o dono veem |
| Ação no meio da fala | `Tem certeza? *saca a espada*` | Balão comum, com o nome, e "saca a espada" em negrito, sem os asteriscos |
| Ação por aspas simples | `'recua um passo' Não me obrigue.` | Igual, com "recua um passo" em negrito |
| Ação por comando | `/me ajeita o casaco` | Balão comum, com o nome e "ajeita o casaco" inteiro em negrito |
| Sussurro | `/w Nome oi` | Balão tracejado cinza, só para quem recebe |
| Fala explícita | `/say olá` | Balão normal, como o texto normal |
| Fora do personagem | `[já volto]` | O balão comum, translúcido, na direção do token, com o nome do jogador e sem os colchetes |
| Fora do personagem no fim | `já volto []` | Igual ao anterior |
| Fora do personagem (Foundry) | `/ooc já volto` | Igual: o comando do Foundry continua valendo |
| Marcas que não valem | `copo d'água, 2*3 e a [espada]` | Fala comum, com o texto como foi escrito |

- [ ] Todos os doze casos acima.
- [ ] **Sem token, Mestre.** Como Mestre, deselecione tudo e mande `teste`: sai como narração, no balão do narrador, no meio da faixa de todos. Mande `*o vento sopra*`: sai como narração, com o texto em negrito. Mande `/shout Silêncio!`: um balão sem nome no meio da tela.
- [ ] **Sem token, jogador.** Como jogador sem token nem personagem, mande `teste`: um balão translúcido com o nome do jogador aparece no meio da faixa.
- [ ] **Modo de mensagem.** Escolha a rolagem privada nos botões do chat lateral e mande uma fala com token: ela continua pública. Role `/roll 1d20`: a rolagem sai privada.
- [ ] **Sem token, em personagem.** Ainda sem token, tente `/think algo`. Aparece um aviso pedindo para selecionar um token.
- [ ] **Comandos do core intactos.** `/roll 1d20` rola normalmente e **não** vira balão.

## 4. B1 — Modo Narrador

- [ ] **Sem token, narra.** Sem token selecionado, o começo da barra mostra um pergaminho, e o texto sem comando sai como **Narrador**.
- [ ] **Ligar.** Selecione um token (o retrato dele aparece na barra) e clique no retrato. Aparece a notificação "Modo Narrador ligado" e o começo da barra volta ao pergaminho.
- [ ] **Personagem de jogador.** Como Mestre, selecione o token de um personagem que tem jogador e mande uma fala: uma caixa pergunta antes. Cancelar (o padrão) deixa o texto na barra; *Falar como…* manda. Marque a caixinha e mande de novo: não pergunta mais por ele até recarregar. `/roll 1d20` e `/n` com o mesmo token não perguntam.
- [ ] **Narrar com token.** Digite `O vento uiva na floresta`. A mensagem sai como **Narrador**, no balão do narrador, no meio da faixa, e **não** gera balão na direção do token, mesmo com o token selecionado.
- [ ] **Comandos passam.** Ainda em Modo Narrador, `/roll 1d20` continua rolando dado normalmente.
- [ ] **Desligar.** Clique de novo no retrato da barra. Notificação "Modo Narrador desligado" e o token volta a falar.
- [ ] **Atalho.** Repita ligando e desligando com **Alt+N**.
- [ ] **Narração pontual.** Com o modo desligado, mande `/n A porta range`. Sai como Narrador sem trocar o modo.
- [ ] **Narração com `=`.** Com o modo desligado, mande `= O sino toca ao longe =`. Sai como Narrador, sem os sinais de igual. Num cliente de jogador, o mesmo texto é recusado com o aviso "Só o Mestre pode narrar."
- [ ] **Nome.** Mude *Nome do narrador* nas configurações para algo como `Cardinal` e confirme que as narrações passam a usar esse nome.
- [ ] **Só Mestre.** Num cliente de jogador, clicar no retrato da barra só leva o cursor para a barra, e `/n` é recusado.

## 4b. D7 — Barra de conversa, contador e digitação

- [ ] **Lugar.** A barra fica no pé da tela, centrada, logo acima da barra de macros ou do HUD da Eternia. Com o painel do HUD aberto, o painel pode cobrir a barra até ser fechado.
- [ ] **Quem fala.** O retrato no começo da barra é o do token selecionado (ou do personagem atribuído); sem nada, a coroa para o Mestre e o avatar para o jogador. Passe o mouse para ver o nome.
- [ ] **Enter fala, Shift+Enter grita.** O campo esvazia na hora e o cursor continua nele.
- [ ] **Setas.** Mande três mensagens; com a barra focada, a seta para cima traz a última, de novo a anterior, e a seta para baixo volta até o rascunho.
- [ ] **Esc.** Esc tira o cursor da barra sem soltar o token selecionado nem fechar janelas.
- [ ] **Enter no mapa.** Com o mapa em foco (nada digitando), Enter leva o cursor para a barra.
- [ ] **Contador.** No fim da barra aparece `0/130`, que sobe conforme você digita e vai ficando vermelho da metade em diante. O teto é fixo e igual em qualquer mundo.
- [ ] **Bloqueio.** No limite, a barra para de aceitar letras. Colar um texto maior que o limite também é recusado. Apagar sempre funciona.
- [ ] **Digitando.** Comece a escrever com um token selecionado: o selo com três pontinhos aparece dentro da arte do token, inclusive para você. Com dois clientes, aparece nos dois.
- [ ] **Some ao enviar, ao apagar, ao parar três segundos e ao sair da barra.**
- [ ] **Troca de token.** Escreva com um token, selecione outro e continue: o selo passa para o novo token.
- [ ] **Sem token ou narrando.** Sem token, ou com o Modo Narrador ligado, escrever não mostra selo.
- [ ] **Desempenho baixo.** Com o Modo de Desempenho do Foundry em Baixo, os pontinhos param de pular.

## 4c. B8 — Balão do narrador

- [ ] **Balão.** Mande `/n A neblina desce.` (ou `= A neblina desce. =`, ou narre com o Modo Narrador): um balão aparece no meio da faixa dos balões, na mesma linha onde nascem os dos tokens, no mesmo formato e tamanho dos balões dos jogadores (ícone de pergaminho no lugar do retrato, "Nome:" e texto na mesma linha), mas preto com letras brancas. Ele pula junto com os outros, mais devagar, e some lá no topo.
- [ ] **Para todos.** Com dois clientes, o balão do narrador aparece nas duas telas.
- [ ] **Sem cena.** Desative a cena (ou abra o mundo sem cena ativa) e narre: o balão aparece do mesmo jeito.
- [ ] **Empilhamento.** Mande três `/n` seguidos: o novo nasce na linha e empurra os anteriores, sem sobreposição. Com falas dos tokens no meio, todos se empurram do mesmo jeito.
- [ ] **Tempo.** Sozinha, uma narração fica pelo menos 30 segundos, mesmo com o *Tempo máximo* em 10: no padrão, ela pula uma vez a cada dois pulos dos outros. Uma fala sem token pula como as dos tokens e leva uns 20 segundos até o topo.
- [ ] **Linha única.** Uma narração de 130 caracteres fica numa linha só, centrada no meio da faixa e crescendo por igual para os dois lados.
- [ ] **Movimento reduzido.** Com *Mostrar animações* desligado no Windows, o *Modo fotossensível* do Foundry ou o Modo de Desempenho em Baixo, os balões pulam de uma vez, sem o deslize curto.
- [ ] **Desligar.** Desligue *Balão do narrador*: a narração fica só no histórico da cena.

## 4d. A9 — Balão de uso da ficha

Com o token do personagem na cena e uma arma na ficha.

- [ ] **Item.** Use a arma pela ficha: um balão bege, com o ícone da arma, diz "Kirito usou Espada Longa". Só o nome, nunca o resultado.
- [ ] **Um só.** Complete o ataque e role o dano pelos botões do cartão: continua **um** balão para o uso inteiro.
- [ ] **Rolagem.** Role uma perícia ou salvaguarda pela ficha: "Kirito rolou Destreza (Acrobacia)", com um ícone de dado.
- [ ] **Iniciativa.** No combate, a iniciativa de cada combatente gera "rolou Iniciativa" sobre cada token.
- [ ] **Alvo.** Uma magia com salvaguarda rolada pelo alvo mostra "Goblin rolou …" sobre o alvo, nunca "Goblin usou <magia>".
- [ ] **Privado.** No modo de rolagem privado, só o Mestre e quem rolou veem o balão; no cego, só o Mestre.
- [ ] **Digitado.** `/roll 1d20` cru não gera balão; `/roll 1d20 # Ataque` gera "rolou Ataque". Uma fala com link de item (`@UUID`) continua sendo balão de fala.
- [ ] **Desligar.** Desligue *Balão de uso da ficha*: usar itens volta a não gerar balão.

## 4e. Chat lateral e A8 — Histórico da cena

- [ ] **Só rolagens.** Fale, grite, sussurre e narre: nada disso aparece no chat lateral, nem nas notificações do canto da tela com a barra lateral recolhida, nem acende o aviso da aba do chat. `/roll 1d20` e os cartões da ficha aparecem como sempre.
- [ ] **Modos de mensagem.** Os botões de modo de mensagem continuam embaixo do chat lateral e mudam a privacidade das rolagens.
- [ ] **Botão.** Na barra de ferramentas dos tokens existe o botão do histórico (balões de conversa); na Eternia, logo abaixo do Mercado.
- [ ] **Janela.** O botão abre o *Histórico da cena* com o nome da cena e cada fala com hora, retrato e nome; a voz do Mestre aparece como "Mestre", com a coroa, e a narração numa faixa escura. Clicar de novo no botão fecha.
- [ ] **Ao vivo.** Com a janela aberta, mande uma fala: ela entra no fim e a janela desce. Suba para reler e mande outra: a janela fica onde você parou.
- [ ] **Clique.** Clique numa fala de um token: o mapa vai até ele.
- [ ] **Privacidade.** Num cliente de jogador, os sussurros e pensamentos de outros não aparecem no histórico.
- [ ] **Troca de cena.** Ative outra cena como Mestre e volte: num cliente de jogador, o histórico da cena começa vazio depois de cada ativação; no do Mestre, a conversa antiga continua lá. Nada é apagado.
- [ ] **Recortes do Mestre.** *Todas as cenas* mostra a conversa de todas as cenas, com uma faixa com o nome de cada uma; *Esta cena* volta. O botão de exportar baixa um JSON com todas as falas do recorte.
- [ ] **Abas do Custom Chat Tabs.** Num mundo de antes da 0.14 com as abas dele ligadas, o Mestre recebe uma vez a pergunta se pode desligá-las; aceitando, a página recarrega sem abas.

## 4f. D8 — Guia do jogador

- [ ] **Botão.** Em *Configurações → TBG* existe *Guia do jogador* com o botão *Criar guia no diário*. Num cliente de jogador ele não aparece.
- [ ] **Criar.** Clique e confirme: surge a notificação, o diário "Guia do TBG" abre com dez páginas e os balões e a barra de exemplo têm o mesmo visual dos de verdade.
- [ ] **Jogador.** Num cliente de jogador o diário abre com oito páginas; "Mestre: narração" e "Mestre: configurações" não aparecem.
- [ ] **Atualizar.** Mova o diário para uma pasta e clique de novo: a notificação diz que foi atualizado, e o diário continua na pasta, com as mesmas permissões.
- [ ] **Valores da mesa.** Mude o *Nome do narrador* e atualize o guia: a página de narração passa a usar o nome novo.

## 5. C1 — Tema do chat

- [ ] **Retrato.** Cada cartão de rolagem do chat lateral tem a imagem do falante, uma só vez. Se o sistema de jogo já desenha um avatar (o dnd5e e a Eternia fazem isso), o TBG não acrescenta outro.
- [ ] **Cor.** O nome aparece na cor do jogador que rolou.
- [ ] **Desligar.** Desligue *Tema do chat* e confirme que os cartões voltam ao visual padrão do Foundry, sem quebrar nada.

## 6. Com mais de um cliente

O teste que mais importa, porque balão é coisa de mesa. Abra uma janela anônima do navegador e entre como jogador, com o Mestre na janela normal.

- [ ] **Todos veem.** Uma fala do Mestre aparece como balão nas duas telas.
- [ ] **Pensamento é privado.** `/think` do Mestre **não** aparece para o jogador, nem no chat nem como balão.
- [ ] **Sussurro é privado.** `/w Jogador oi` aparece só para o alvo, com balão, e não para terceiros.
- [ ] **Jogador fala.** O jogador seleciona o próprio token e fala: o balão aparece nas duas telas.
- [ ] **Narração e voz do Mestre.** A narração e a fala do Mestre sem token chegam ao jogador como balões no meio da faixa, e entram no histórico dele.
- [ ] **Token escondido.** Uma fala do Mestre por um token escondido aparece só para o Mestre; o jogador não vê balão nem buraco na faixa.
- [ ] **Sem duplicata.** Nenhuma mensagem gera dois balões sobrepostos em nenhuma das telas.

## 7. Verificação automática

Cole no console (F12) do cliente do **Mestre**, com uma cena aberta. O script cria dois atores e tokens de teste, leva a vista até eles, escreve pela barra de conversa, exercita tudo e imprime uma tabela de aprovado e reprovado. Para medir os pulos e o tempo do narrador ele muda por alguns segundos a *Velocidade de subida*, o *Empilhamento* e o *Tempo máximo*, e devolve tudo, a vista também, no fim; ele leva cerca de um minuto. Para testar a troca de cena, ele cria e ativa uma cena temporária e depois volta para a cena aberta, o que recomeça o histórico dos jogadores nessa cena, então rode num mundo de teste. No fim ele apaga os atores, os tokens, a cena e as mensagens que criou.

```js
await (async () => {
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (n, p, d = "") => results.push({ teste: n, ok: p ? "PASSOU" : "FALHOU", detalhe: d });
  const xOf = el => { const m = el?.style.translate.match(/([+-])\s*([\d.]+)px/); return m ? (m[1] === "-" ? -1 : 1) * parseFloat(m[2]) : NaN; };
  const yOf = el => el ? new DOMMatrix(el.style.transform).m42 : NaN;
  const rect = el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
  const umaLinha = el => { const s = getComputedStyle(el); return el.offsetHeight < parseFloat(s.lineHeight) * 1.5 + el.offsetHeight - el.clientHeight + parseFloat(s.paddingTop) * 2; };
  const bubbles = id => [...document.querySelectorAll(`#tbg-bubbles .tbg-bubble[data-token-id="${id}"]`)];
  const bubbleOf = id => document.querySelector(`#tbg-bubbles .tbg-bubble[data-message-id="${id}"]`);
  const vivos = () => [...document.querySelectorAll("#tbg-bubbles .tbg-bubble")].filter(el => !el.getAnimations().some(a => Number(a.effect?.getKeyframes().at(-1)?.opacity) === 0));
  const escala = Number(getComputedStyle(document.body).getPropertyValue("--ui-scale")) || 1;
  const direita = r => r?.height ? r.right : 0;
  const meioDaFaixa = () => (Math.max(0, ...[ui.controls, ui.nav].map(a => direita(a?.element?.getBoundingClientRect()))) + (ui.sidebar?.element?.getBoundingClientRect().left ?? innerWidth)) / 2 / escala;
  const naFaixa = token => ((token.center.x - canvas.stage.pivot.x) * canvas.stage.scale.x + canvas.stage.position.x) / escala;
  const linhaBase = () => Math.min(game.settings.get("tbg", "bubbleRiseLimit"), innerHeight / escala * 0.9);
  const sobrepostos = lista => { let n = 0; const r = lista.map(el => el.getBoundingClientRect()); for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[i].left < r[j].right && r[i].right > r[j].left && r[i].top < r[j].bottom && r[i].bottom > r[j].top) n++; return n; };
  const logOf = id => ui.chat.element.querySelector(`.chat-log [data-message-id="${id}"]`);
  const escondido = el => !el || getComputedStyle(el).display === "none";
  const kindOf = el => [...(el?.classList ?? [])].find(c => c.startsWith("tbg-bubble--") && !c.endsWith("visible"))?.slice(12);
  const barra = () => document.getElementById("tbg-chat-bar");
  const campo = () => barra().querySelector(".tbg-bar__input");
  const tecla = (key, extra = {}) => campo().dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra }));
  const say = async (texto, extra = {}) => {
    campo().focus();
    campo().value = texto;
    campo().dispatchEvent(new InputEvent("input", { bubbles: true }));
    tecla("Enter", extra);
    await pause(500);
    return game.messages.contents.at(-1);
  };
  const module = game.modules.get("tbg");
  const inicio = Date.now();
  const modo = game.settings.get("core", "messageMode");

  check("módulo ativo", module?.active === true, module?.version ?? "ausente");
  check("opção do core Enable Chat Bubbles", game.settings.get("core", "chatBubbles") === true);
  const faixa = document.getElementById("tbg-bubbles");
  check("faixa dos balões presa à tela", faixa?.parentElement === document.body && getComputedStyle(faixa).position === "fixed");
  check("comandos registrados", Object.keys(foundry.applications.sidebar.tabs.ChatLog.CHAT_COMMANDS).filter(k => k.startsWith("tbg")).length === 6);
  check("atalhos registrados", game.keybindings.actions.has("tbg.toggleNarrator") && game.keybindings.actions.has("tbg.focusChatBar"));
  check("selo de digitação no HUD", document.getElementById("tbg-typing-indicators")?.parentElement === canvas.hud.element);
  check("barra de conversa no pé da tela", barra()?.parentElement?.id === "ui-bottom" && barra() === barra().parentElement.firstElementChild);
  check("campo do chat lateral escondido", escondido(document.getElementById("chat-message")));
  check("modos de mensagem continuam", !escondido(document.getElementById("message-modes")));
  check("velocidade de subida padrão", game.settings.settings.get("tbg.bubbleRiseSpeed").default === 15);
  const ferramentas = Object.values(ui.controls.controls.tokens.tools).sort((a, b) => a.order - b.order).map(t => t.name);
  const mercado = ferramentas.indexOf("eterniaMarket");
  check("botão do histórico", mercado < 0 ? ferramentas.includes("tbgHistory") : ferramentas[mercado + 1] === "tbgHistory", ferramentas.join(" > "));

  const tipos = Object.keys(game.system.documentTypes.Actor);
  const type = tipos.find(t => t !== "character") ?? tipos[0];
  const actors = await Actor.createDocuments([{ name: "TBG Teste A", type }, { name: "TBG Teste B", type }]);
  const actorA = actors.find(a => a.name === "TBG Teste A");
  const docs = await Promise.all(["TBG Teste A", "TBG Teste B"].map((name, i) => actors.find(a => a.name === name).getTokenDocument({ x: canvas.dimensions.sceneX + 300 + i * 1500, y: canvas.dimensions.sceneY + 700 })));
  const tokens = await canvas.scene.createEmbeddedDocuments("Token", docs.map(d => d.toObject()));
  await pause(800);
  const [tokenA, tokenB] = ["TBG Teste A", "TBG Teste B"].map(name => canvas.tokens.get(tokens.find(t => t.actorId === actors.find(a => a.name === name).id).id));
  const vista = { x: canvas.stage.pivot.x, y: canvas.stage.pivot.y, scale: canvas.stage.scale.x };
  canvas.pan({ x: tokenA.center.x - (meioDaFaixa() * escala - canvas.stage.position.x), y: tokenA.center.y, scale: 1 });
  const subida = game.settings.get("tbg", "bubbleRiseSpeed");
  await game.settings.set("tbg", "bubbleRiseSpeed", 0);

  tokenA.control({ releaseOthers: true });
  await pause(200);
  const rotulo = barra().querySelector(".tbg-bar__speaker").ariaLabel;
  check("retrato do token na barra", !barra().querySelector(".tbg-bar__portrait").hidden && rotulo.includes("TBG Teste A"), rotulo);
  await say("Primeira."); await say("Segunda."); await say("Terceira.");
  await pause(400);
  const stack = bubbles(tokenA.id);
  check("três balões, sem duplicata", stack.length === 3, `${stack.length} na tela`);
  const colisoes = sobrepostos(stack);
  check("nenhuma sobreposição", colisoes === 0, `${colisoes} colisões`);
  check("o balão novo nasce na linha da faixa", Math.abs(yOf(stack[2]) - linhaBase()) < 1, `${yOf(stack[2])} / ${linhaBase()}`);
  check("o novo empurra os antigos para cima", yOf(stack[0]) < yOf(stack[1]) && yOf(stack[1]) < yOf(stack[2]), stack.map(yOf).join(" < "));
  check("balão nasce embaixo do token", Math.abs(xOf(stack[2]) - naFaixa(tokenA)) < 1, `${xOf(stack[2])} / ${Math.round(naFaixa(tokenA))}`);
  const terceira = game.messages.contents.at(-1);
  check("fala fora do chat lateral", escondido(logOf(terceira.id)));
  check("cena gravada na fala", terceira.getFlag("tbg", "scene") === canvas.scene.id);

  const antesX = bubbles(tokenA.id).map(xOf);
  await tokenA.document.update({ x: tokenA.document.x + 400 }, { animate: false });
  await pause(600);
  check("o balão fica onde foi dito", bubbles(tokenA.id).map(xOf).every((v, i) => v === antesX[i]), bubbles(tokenA.id).map(xOf).join(" "));
  await tokenA.document.update({ x: tokenA.document.x - 400 }, { animate: false });
  await pause(400);

  const antesY = bubbles(tokenA.id).map(yOf);
  const pivo = { x: canvas.stage.pivot.x, y: canvas.stage.pivot.y };
  canvas.pan({ x: pivo.x + 200, y: pivo.y + 150 });
  await pause(100);
  const andou = bubbles(tokenA.id).map((b, i) => [xOf(b) - antesX[i], yOf(b) - antesY[i]]);
  canvas.pan(pivo);
  await pause(100);
  check("pan leva os balões só na horizontal", andou.every(([dx, dy]) => Math.abs(dx + 200 / escala) < 1 && dy === 0), andou.map(d => d.join("/")).join(" "));

  tokenB.control({ releaseOthers: true });
  await say("Coluna separada.");
  await pause(400);
  check("colunas independentes (free flow)", JSON.stringify(antesY) === JSON.stringify(bubbles(tokenA.id).map(yOf)));
  await game.settings.set("tbg", "bubbleLayout", "line");
  await say("Empurra a faixa inteira.");
  await pause(400);
  check("linha a linha empurra todos", bubbles(tokenA.id).every((b, i) => yOf(b) < antesY[i]), bubbles(tokenA.id).map(yOf).join(" "));
  await game.settings.set("tbg", "bubbleLayout", "freeflow");

  await game.settings.set("tbg", "bubbleRiseSpeed", 60);
  const pulo = bubbleOf((await say("Pulando.")).id);
  const linha = pulo.offsetHeight + 8;
  const momentos = [];
  const marco = performance.now();
  const olho = new MutationObserver(() => momentos.push(performance.now() - marco));
  olho.observe(faixa, { attributes: true, subtree: true, attributeFilter: ["style"] });
  await pause(2500);
  olho.disconnect();
  const pulos = momentos.reduce((grupos, t) => (grupos.length && t - grupos.at(-1).at(-1) < 100 ? grupos.at(-1).push(t) : grupos.push([t]), grupos), []);
  const degraus = (linhaBase() - yOf(pulo)) / linha;
  check("sobe aos pulos de uma linha", Number.isInteger(degraus) && degraus >= 2, `${degraus} linhas`);
  check("nada se mexe entre os pulos", pulos.length >= 2 && pulos.every((g, i) => !i || g[0] - pulos[i - 1].at(-1) > 300), pulos.map(g => Math.round(g[0])).join(" "));
  check("o pulo é uma transição curta", getComputedStyle(pulo).transitionProperty.includes("transform") && parseFloat(getComputedStyle(pulo).transitionDuration.split(",")[1]) <= 0.3, getComputedStyle(pulo).transition);
  await game.settings.set("tbg", "bubbleRiseSpeed", 0);

  tokenA.control({ releaseOthers: true });
  await game.settings.set("core", "messageMode", "gm");
  const publica = await say("Fala no modo privado.");
  check("fala pública em qualquer modo de mensagem", publica.whisper.length === 0 && publica.style === CONST.CHAT_MESSAGE_STYLES.IC);
  await game.settings.set("core", "messageMode", modo);
  const grito = await say("ACORDEM", { shiftKey: true });
  check("Shift+Enter grita", kindOf(bubbleOf(grito.id)) === "shout");
  for (const [texto, esperado] of [["/shout GRITO", "shout"], ["/think penso", "think"], ["/say falo", "say"], ["/ooc do Foundry", "ooc"]]) {
    const m = await say(texto);
    check(`comando ${texto.split(" ")[0]}`, kindOf(bubbleOf(m.id)) === esperado, kindOf(bubbleOf(m.id)) ?? "nenhum balão");
  }
  const negrito = m => bubbleOf(m.id)?.querySelector(".tbg-bubble__text strong")?.textContent;
  const acao = await say("Tem certeza? *aponta a lâmina*");
  check("ação no meio da fala, em negrito", acao.content === "Tem certeza? <strong>aponta a lâmina</strong>" && kindOf(bubbleOf(acao.id)) === "say" && negrito(acao) === "aponta a lâmina", acao.content);
  check("ação no balão comum, com o nome", bubbleOf(acao.id)?.querySelector(".tbg-bubble__name")?.textContent === acao.alias);
  const aspas = await say("'recua um passo' Não me obrigue.");
  check("ação entre aspas simples", aspas.content === "<strong>recua um passo</strong> Não me obrigue.", aspas.content);
  const gesto = await say("/me gesticula");
  check("/me vira ação inteira", gesto.content === "<strong>gesticula</strong>" && kindOf(bubbleOf(gesto.id)) === "say" && !gesto.content.includes(gesto.alias), gesto.content);
  const literal = await say("Um copo d'água, 2*3 e a [espada].");
  check("apóstrofo, conta e colchete no meio ficam", literal.content === "Um copo d'água, 2*3 e a [espada]." && literal.getFlag("tbg", "kind") === "say", literal.content);
  const fimOff = await say("já volto []");
  check("texto terminado em [] sai fora do personagem", fimOff.style === CONST.CHAT_MESSAGE_STYLES.OOC && fimOff.content === "já volto" && kindOf(bubbleOf(fimOff.id)) === "ooc", fimOff.content);
  const off = await say("[fora do personagem]");
  const balaoOff = bubbleOf(off.id);
  check("colchetes saem fora do personagem", off.style === CONST.CHAT_MESSAGE_STYLES.OOC && off.content === "fora do personagem" && off.alias === game.user.name, `${off.content} / ${off.alias}`);
  check("fora do personagem no balão comum, translúcido", kindOf(balaoOff) === "ooc" && getComputedStyle(balaoOff).filter.startsWith("opacity(") && getComputedStyle(balaoOff).backgroundColor === getComputedStyle(bubbleOf(acao.id)).backgroundColor, balaoOff ? getComputedStyle(balaoOff).filter : "nenhum balão");

  tecla("ArrowUp");
  check("seta para cima traz a última", campo().value === "[fora do personagem]", campo().value);
  tecla("ArrowDown");
  check("descer volta ao rascunho", campo().value === "");
  const limite = campo().maxLength;
  campo().value = "a".repeat(limite);
  campo().dispatchEvent(new InputEvent("input", { bubbles: true }));
  campo().setSelectionRange(limite, limite);
  const extra = new InputEvent("beforeinput", { inputType: "insertText", data: "b", bubbles: true, cancelable: true });
  campo().dispatchEvent(extra);
  const contador = barra().querySelector(".tbg-bar__count");
  check("limite de 130 caracteres", limite === 130 && extra.defaultPrevented && contador.textContent === "130/130", contador.textContent);
  campo().value = "";
  campo().dispatchEvent(new InputEvent("input", { bubbles: true }));
  campo().focus();
  tecla("Escape");
  check("Esc sai da barra sem soltar o token", document.activeElement !== campo() && tokenA.controlled);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
  await pause(100);
  check("Enter leva o cursor para a barra", document.activeElement === campo());
  campo().blur();

  const balao = bubbles(tokenA.id).find(b => b.querySelector(".tbg-bubble__portrait"));
  if (balao) {
    const p = rect(balao.querySelector(".tbg-bubble__portrait"));
    const n = rect(balao.querySelector(".tbg-bubble__name"));
    const t = rect(balao.querySelector(".tbg-bubble__text"));
    check("nome ao lado do retrato", n.l >= p.r - 1 && n.t < p.b && n.b > p.t);
    check("fala na mesma linha do nome", t.l >= n.r - 1 && t.t < n.b && t.b > n.t);
    check("balão de fala curta numa linha", umaLinha(balao), `${balao.offsetHeight}px`);
  }
  const longa = bubbleOf((await say("Uma fala bem comprida, perto do limite de caracteres, continua numa linha só, cresce por igual para os dois lados e nunca quebra.")).id);
  check("fala longa numa linha só", !!longa && umaLinha(longa), longa ? `${longa.offsetWidth} × ${longa.offsetHeight}px` : "nenhum balão");
  check("fala longa centrada no token", Math.abs(xOf(longa) - naFaixa(tokenA)) < 1, `${Math.round(xOf(longa))} / ${Math.round(naFaixa(tokenA))}`);

  canvas.tokens.releaseAll();
  await pause(200);
  check("pergaminho do narrador sem token", barra().querySelector(".tbg-bar__icon").classList.contains("fa-scroll"));
  const semToken = await say("A porta range devagar.");
  check("Mestre sem token narra", semToken.getFlag("tbg", "kind") === "narration" && kindOf(bubbleOf(semToken.id)) === "narration" && !!bubbleOf(semToken.id).querySelector(".tbg-bubble__name"));
  const vento = await say("*o vento sopra*");
  check("ação do Mestre sem token entra na narração", vento.getFlag("tbg", "kind") === "narration" && vento.content === "<strong>o vento sopra</strong>", vento.content);
  const mestre = await say("/shout Silêncio!");
  const meio = bubbleOf(mestre.id);
  check("comando do Mestre sem token, sem nome", !!meio && kindOf(meio) === "shout" && !meio.querySelector(".tbg-bubble__name") && !meio.dataset.tokenId);
  const narracao = await say("/n A neblina desce.");
  const narrador = bubbleOf(narracao.id);
  check("narração sem balão no token", narracao.getFlag("tbg", "kind") === "narration" && kindOf(narrador) === "narration" && !narrador.dataset.tokenId, narracao.alias);
  check("balão do narrador nasce na linha da faixa", Math.abs(yOf(narrador) - linhaBase()) < 1, `${yOf(narrador)} / ${linhaBase()}`);
  check("balão do narrador no meio da faixa", Math.abs(xOf(narrador) - meioDaFaixa()) < 1 && !!narrador.querySelector(".tbg-bubble__name"), `${Math.round(xOf(narrador))} / ${Math.round(meioDaFaixa())}`);
  check("balão do narrador numa linha", umaLinha(narrador));
  const fala = bubbles(tokenA.id).find(b => b.classList.contains("tbg-bubble--say"));
  const estilo = el => el ? getComputedStyle(el) : {};
  check("balão do narrador no formato do jogador", ["fontSize", "padding", "borderRadius", "borderTopWidth"].every(p => estilo(narrador)[p] === estilo(fala)[p]), `${estilo(narrador).fontSize} / ${estilo(fala).fontSize}`);
  await pause(300);
  const cheia = sobrepostos(vivos());
  check("nenhuma sobreposição na faixa", cheia === 0, `${cheia} colisões em ${vivos().length} balões`);

  await game.settings.set("tbg", "bubbleRiseSpeed", 120);
  tokenA.control({ releaseOthers: true });
  const passageira = await say("Passo rápido.");
  canvas.tokens.releaseAll();
  const demorada = await say("/n O narrador demora.");
  await pause(4500);
  check("narrador sobe mais devagar que as falas", !bubbleOf(passageira.id) && !!bubbleOf(demorada.id));
  await game.settings.set("tbg", "bubbleRiseSpeed", 0);
  const maximo = game.settings.get("tbg", "bubbleMaxLifetime");
  await game.settings.set("tbg", "bubbleMaxLifetime", 5);
  tokenA.control({ releaseOthers: true });
  const breve = await say("Vai sumir.");
  canvas.tokens.releaseAll();
  const curta = await say("/n O sino toca.");
  await pause(5200);
  check("narrador fica 30 s mesmo com Tempo máximo menor", !bubbleOf(breve.id) && !!bubbleOf(curta.id));
  await game.settings.set("tbg", "bubbleMaxLifetime", maximo);
  await game.settings.set("tbg", "bubbleRiseSpeed", subida);
  check("narração fora do chat lateral", escondido(logOf(narracao.id)));
  const marcada = await say("= O sino toca ao longe. =");
  check("= texto = vira narração", marcada.getFlag("tbg", "kind") === "narration" && marcada.content === "O sino toca ao longe.", marcada.content);

  tokenA.control({ releaseOthers: true });
  await pause(200);
  check("Modo Narrador vale também com token", (await (async () => { const { toggleNarrator } = await import("/modules/tbg/scripts/chat/narrator.mjs"); await toggleNarrator(); const m = await say("O sino toca."); await toggleNarrator(); return m.getFlag("tbg", "kind") === "narration" && !bubbleOf(m.id)?.dataset.tokenId; })()));
  const jogador = game.users.find(u => !u.isGM);
  if (jogador) {
    await actorA.update({ [`ownership.${jogador.id}`]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER });
    const caixa = () => [...foundry.applications.instances.values()].find(a => a.rendered && a.element?.querySelector('input[name="remember"]'));
    const antes = game.messages.size;
    campo().focus(); campo().value = "Fala do Mestre pelo jogador."; tecla("Enter");
    await pause(600);
    check("aviso ao falar por personagem de jogador", !!caixa() && game.messages.size === antes);
    caixa()?.element.querySelector('[data-action="cancel"]').click();
    await pause(400);
    check("cancelar deixa o texto na barra", game.messages.size === antes && campo().value === "Fala do Mestre pelo jogador.");
    tecla("Enter");
    await pause(600);
    const marcar = caixa()?.element.querySelector('input[name="remember"]');
    if (marcar) marcar.checked = true;
    caixa()?.element.querySelector('[data-action="speak"]').click();
    await pause(700);
    check("confirmar manda a fala", game.messages.contents.at(-1)?.content === "Fala do Mestre pelo jogador." && campo().value === "");
    await say("De novo, sem perguntar.");
    check("não pergunta de novo por ele", !caixa() && game.messages.contents.at(-1)?.content === "De novo, sem perguntar.");
    await actorA.update({ [`ownership.-=${jogador.id}`]: null });
  }
  const falante = ChatMessage.getSpeaker({ token: tokenA.document });
  const [espada] = await actorA.createEmbeddedDocuments("Item", [{ name: "TBG Espada", type: Object.keys(game.system.documentTypes.Item)[0] }]);
  const cartao = await ChatMessage.create({ speaker: falante, content: `<div data-item-id="${espada.id}">cartão</div>` });
  await pause(400);
  check("uso de item vira balão", kindOf(bubbleOf(cartao.id)) === "usage" && bubbleOf(cartao.id)?.textContent.includes("TBG Espada"));
  check("cartão no chat lateral", !!logOf(cartao.id) && !escondido(logOf(cartao.id)));
  const dano = await ChatMessage.create({ speaker: falante, flavor: "Dano", rolls: [await new Roll("1d6").evaluate()], flags: { tbgTeste: { originatingMessage: cartao.id } } });
  await pause(400);
  check("rolagem ligada ao uso não repete", !bubbleOf(dano.id));
  const percepcao = await ChatMessage.create({ speaker: falante, flavor: "Percepção", rolls: [await new Roll("1d20").evaluate()] });
  await pause(400);
  check("rolagem com rótulo vira balão", bubbleOf(percepcao.id)?.textContent.includes("Percepção") === true);
  const crua = await say("/roll 1d20");
  check("rolagem crua sem balão e no chat lateral", !bubbleOf(crua.id) && !escondido(logOf(crua.id)));
  const sussurrado = await ChatMessage.create({ speaker: falante, content: "<div>cartão de sistema</div>", whisper: [game.user.id] });
  await pause(400);
  check("cartão sussurrado sem balão, no chat lateral", !bubbleOf(sussurrado.id) && !escondido(logOf(sussurrado.id)));
  check("balão do core silenciado", document.querySelectorAll("#chat-bubbles .chat-bubble").length === 0);

  document.querySelector('#scene-controls-tools [data-tool="tbgHistory"]')?.click();
  await pause(900);
  const linhas = [...document.querySelectorAll("#tbg-history .tbg-history__line")].map(l => l.dataset.messageId);
  check("histórico com a conversa da cena", [terceira, grito, acao, off, semToken, vento, mestre, narracao].every(m => linhas.includes(m.id)), `${linhas.length} linhas`);
  check("ação em negrito no histórico", document.querySelector(`#tbg-history [data-message-id="${acao.id}"] .tbg-history__text strong`)?.textContent === "aponta a lâmina");
  check("histórico sem rolagens nem cartões", ![cartao, percepcao, crua].some(m => linhas.includes(m.id)));
  check("Mestre no histórico", document.querySelector(`#tbg-history [data-message-id="${mestre.id}"] .tbg-history__name`)?.textContent === game.i18n.localize("TBG.History.master"));

  campo().focus();
  campo().value = "digitando";
  campo().dispatchEvent(new InputEvent("input", { bubbles: true }));
  await pause(300);
  check("indicador de digitação", !!document.querySelector(`#tbg-typing-indicators .tbg-typing[data-token-id="${tokenA.id}"]`));
  campo().value = "";
  campo().dispatchEvent(new InputEvent("input", { bubbles: true }));
  campo().blur();
  await pause(300);
  check("indicador some ao apagar", !document.querySelector(".tbg-typing"));

  if (!game.journal.some(j => j.getFlag("tbg", "guide"))) {
    const { writeGuide } = await import("/modules/tbg/scripts/guide/guide.mjs");
    await writeGuide();
    const guia = game.journal.find(j => j.getFlag("tbg", "guide"));
    check("guia criado com dez páginas", guia?.pages.size === 10, `${guia?.pages.size ?? 0} páginas`);
    const { INHERIT, NONE } = CONST.DOCUMENT_OWNERSHIP_LEVELS;
    check("páginas do Mestre ocultas", guia?.pages.filter(p => p.ownership.default === NONE).length === 2);
    check("páginas dos jogadores visíveis", guia?.pages.filter(p => p.ownership.default === INHERIT).length === 8);
    check("exemplos com a marcação dos balões e da barra", guia?.pages.some(p => p.text.content.includes("tbg-bubble--say")) && guia?.pages.some(p => p.text.content.includes("tbg-bar__input")));
    await guia?.sheet.close();
    await guia?.delete();
  }

  canvas.tokens.releaseAll();
  await pause(1500);
  const original = canvas.scene;
  const [temporaria] = await Scene.createDocuments([{ name: "TBG Cena Temporária", width: 1000, height: 800 }]);
  await temporaria.activate();
  for (let i = 0; i < 40 && canvas.scene?.id !== temporaria.id; i++) await pause(250);
  await pause(1500);
  check("trocar de cena não apaga nada", [terceira, semToken, mestre, narracao, crua, cartao].every(m => game.messages.has(m.id)));
  check("cena ativada guarda a hora", (temporaria.getFlag("tbg", "talkSince") ?? 0) >= inicio - 60000);
  check("histórico da cena nova vazio", !!document.querySelector("#tbg-history .tbg-history__empty"));
  document.querySelector('#tbg-history [data-scope="all"]')?.click();
  await pause(800);
  const todas = [...document.querySelectorAll("#tbg-history .tbg-history__line")].map(l => l.dataset.messageId);
  check("Mestre vê todas as cenas", todas.includes(terceira.id) && !!document.querySelector("#tbg-history .tbg-history__divider"));
  const BlobReal = window.Blob, clicarReal = HTMLAnchorElement.prototype.dispatchEvent;
  let exportado = null, arquivo = null;
  window.Blob = class extends BlobReal { constructor(partes, opcoes) { super(partes, opcoes); exportado = { texto: partes.join(""), tipo: opcoes?.type }; } };
  HTMLAnchorElement.prototype.dispatchEvent = function (evento) { if (this.download) { arquivo = this.download; return true; } return clicarReal.call(this, evento); };
  document.querySelector('#tbg-history [data-action="export"]')?.click();
  window.Blob = BlobReal;
  HTMLAnchorElement.prototype.dispatchEvent = clicarReal;
  const json = exportado ? JSON.parse(exportado.texto) : null;
  check("exportar em JSON", exportado?.tipo === "application/json" && json?.lines.some(l => l.text === "Terceira." && l.kind === "say"), arquivo);
  check("exportação devolve os asteriscos da ação", json?.lines.some(l => l.text === "Tem certeza? *aponta a lâmina*"));
  document.querySelector('#tbg-history [data-scope="scene"]')?.click();
  await original.activate();
  for (let i = 0; i < 40 && canvas.scene?.id !== original.id; i++) await pause(250);
  await pause(1500);
  check("Mestre vê a conversa antiga da cena", [...document.querySelectorAll("#tbg-history .tbg-history__line")].some(l => l.dataset.messageId === terceira.id));
  await temporaria.delete();
  await foundry.applications.instances.get("tbg-history")?.close();

  canvas.pan(vista);
  await canvas.scene.deleteEmbeddedDocuments("Token", tokens.map(t => t.id));
  await Actor.deleteDocuments(actors.map(a => a.id));
  await ChatMessage.deleteDocuments(game.messages.filter(m => m.timestamp >= inicio).map(m => m.id));
  await pause(600);
  const orfaos = document.querySelectorAll(tokens.map(t => `#tbg-bubbles .tbg-bubble[data-token-id="${t.id}"]`).join(", ")).length;
  check("nenhum balão órfão no fim", orfaos === 0, `${orfaos} restaram`);

  console.table(results);
  const failed = results.filter(r => r.ok === "FALHOU");
  console.log(failed.length ? `${failed.length} teste(s) falharam` : `Todos os ${results.length} testes passaram.`);
  return results;
})();
```

O script não cobre o que depende de olho humano ou de um segundo cliente: aparência dos balões, da barra e da janela do histórico, a sensação dos pulos, o zoom, uso de item de verdade pela ficha e os testes da seção 6. Faça esses à mão. A contagem de órfãos olha só os tokens de teste, porque balões de mensagens anteriores podem estar legitimamente na tela.

## 8. Ao reportar um problema

Abra uma [issue](https://github.com/rezendesjoao/tbg/issues) com a versão do Foundry, a versão do TBG, o sistema de jogo, os outros módulos ativos, o que você fez, o que esperava e o que aconteceu, mais qualquer erro em vermelho do console (F12). A saída do script da seção 7 ajuda bastante.
