# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versionamento semântico.

## [0.16.2] — 2026-11-05

### Alterado
- **Verificado para toda a versão 14 do Foundry** (antes, só até a 14.367). Na 14.370 e nas próximas builds da v14, o TBG deixa de aparecer como "não verificado" na lista de módulos. Nenhuma mudança de código: o TBG não usa a única API que a 14.370 alterou.

## [0.16.1] — 2026-11-02

### Corrigido
- **Os balões nasciam no pé da tela, atrás da barra de conversa**, nas mesas que tinham aumentado o antigo *Limite de subida*: a 0.16.0 usou a mesma configuração para a altura da faixa, que tem outro sentido. A *Altura da faixa dos balões* agora é uma configuração nova, que ignora o valor antigo e começa mais perto do topo (200 pixels; antes, 320), e a linha onde os balões nascem nunca passa do meio da tela.

## [0.16.0] — 2026-11-02

Os balões saem de uma faixa só, presa ao topo da tela, como nas salas de bate-papo dos jogos: todos nascem na mesma linha, se empurram sem nunca se sobrepor e sobem aos pulos, uma linha por vez, até sumir lá em cima.

### Alterado
- **A faixa dos balões.** Todo balão nasce na mesma linha, perto do topo da tela (a 320 pixels dele, no padrão), na direção do token que fala; a narração e a conversa sem token nascem no meio. O balão novo empurra para cima os que encosta, e a colisão vale entre todos: balões de tokens diferentes, a narração e o balão de uso da ficha nunca ficam um por cima do outro. Perto da borda, o balão se encosta na parte visível, sem entrar embaixo da barra lateral nem da lista de cenas.
- **Sobem aos pulos.** Em vez de subir devagar sem parar, os balões ficam parados e, de tempos em tempos, pulam uma linha todos juntos, num movimento curto (no padrão, mais ou menos um pulo a cada dois segundos); quem passa do topo some. O balão recém-nascido espera um instante antes do primeiro pulo. Nada roda a cada quadro, e no Modo de Desempenho Baixo, com o movimento reduzido do sistema ou no modo fotossensível, o pulo é imediato.
- **O balão fica onde foi dito.** Ele não segue mais o token que anda nem some quando o token sai da cena; quando você arrasta o mapa, os balões dos tokens andam junto só na horizontal, e o zoom só muda o lugar deles na linha.
- **O narrador na faixa.** O balão do narrador nasce no meio da faixa, na mesma linha dos outros, e pula mais devagar que eles, para ficar pelo menos 30 segundos quando nada o empurra.
- *Limite de subida* vira *Altura da faixa dos balões*: a distância do topo da tela até a linha onde os balões nascem. A *Velocidade de subida* passa a ser a média dos pulos.
- A fala de um token que você não vê não vira balão (antes, um balão invisível ocupava o lugar e empurrava os vizinhos).

### Removido
- Os balões do meio da tela, que viraram parte da faixa, e a configuração *Tempo mínimo dos balões do meio da tela*.
- *Escala dos balões*: na faixa, os balões têm sempre o mesmo tamanho, em qualquer zoom.

## [0.15.0] — 2026-11-02

### Adicionado
- Histórico da cena, para o Mestre: os botões *Esta cena* e *Todas as cenas* (com uma faixa com o nome de cada cena) e *Exportar em JSON*, que baixa toda a conversa do recorte aberto (hora, cena, tipo, quem falou, o jogador, os destinatários de um sussurro e o texto) para ler fora do Foundry. A janela mostra as últimas 500 falas e avisa quantas ficaram de fora.
- **Ação no meio da fala.** O que estiver entre asteriscos ou entre aspas simples vira ação, sozinho ou junto da fala: `Você tem certeza? *aponta a lâmina para ele*` sai num balão só, com os asteriscos sumidos e a ação em negrito. Vale em qualquer conversa (fala, grito, sussurro, pensamento, narração), e o apóstrofo de `d'água` e a conta `2*3` ficam como estão. A exportação do histórico devolve os asteriscos.
- **Fora do personagem entre colchetes.** A mensagem inteira entre colchetes, `[já volto]`, ou terminada em `[]`, `já volto []`, sai fora do personagem, com o nome do jogador. O `/ooc` do Foundry continua valendo.
- **Aviso ao falar por personagem de jogador.** Quando o Mestre vai mandar uma fala (texto, grito, ação, pensamento ou sussurro) pelo token de um personagem que tem jogador (dono ou personagem atribuído), uma caixa pergunta antes; cancelar, o padrão, deixa o texto na barra. Uma caixinha deixa de perguntar por aquele personagem até recarregar a página. Rolagens, narração e o fora do personagem não perguntam.

### Alterado
- **A conversa nunca é apagada.** Ativar outra cena não apaga mais nada: a cena guarda a hora em que foi ativada, e o histórico dos jogadores recomeça dali; o do Mestre mostra a cena inteira, de todas as visitas.
- **Os balões do meio da tela duram como os de cima dos tokens:** as falas sem token ficam pelo menos o tempo que um balão sobre o token leva para subir até o *Limite de subida* (uns 21 segundos no padrão), e textos longos, até um minuto; o *Tempo máximo* dos balões também vale para elas. Cabem até cinco na tela.
- **O balão do narrador nasce mais alto e fica pelo menos 30 segundos**, mesmo com um *Tempo máximo* menor. Os balões do meio da tela nascem um pouco acima do centro (antes, bem abaixo dele) e, para o narrador caber esse tempo todo na tela, sobem mais devagar nas telas baixas, todos na mesma velocidade.
- **A ação e o fora do personagem usam o balão comum.** A ação sai em negrito no balão de quem fala, com o nome (antes, um balão bege em itálico e sem nome); o fora do personagem é o balão comum, só translúcido (antes, cinza). O `/me` do Foundry vira uma ação inteira. Do Mestre sem token, a ação entre asteriscos entra na narração.

### Removido
- O comando `/off`, trocado pelos colchetes, e o comando `*texto*` de mensagem inteira com balão próprio, trocado pela ação no meio da fala.

## [0.14.1] — 2026-11-01

### Alterado
- Sem token selecionado, o Mestre **narra**: o texto sem comando sai como o narrador, no balão do narrador no meio da tela, em vez do balão sem nome. O retrato da barra mostra o pergaminho enquanto nada está selecionado. O Modo Narrador (retrato da barra ou Alt+N) passa a valer para quando há um token selecionado. Os comandos do Mestre sem token (`*ação*`, `/shout`, `/w`) continuam saindo sem nome.
- O limite de caracteres por mensagem sobe de 100 para 130, igual para toda mesa e todo jogador; o contador da barra mostra `n/130`.

## [0.14.0] — 2026-11-01

### Adicionado
- D7: a **barra de conversa**, no pé da tela, acima da barra de macros ou do que tomou o lugar dela (o HUD da Eternia): é onde todo mundo escreve. Enter fala, Shift+Enter grita, Esc sai da barra sem soltar o token e as setas trazem de volta as últimas mensagens mandadas. O retrato no começo mostra por quem você vai falar (o token, o personagem, a coroa do Mestre sem token ou o pergaminho do narrador), e o contador de 100 caracteres fica no fim. Com o mapa em foco, Enter leva o cursor até ela (atalho configurável).
- A8: o **Histórico da cena**, um botão na barra de ferramentas dos tokens (na Eternia, logo abaixo do Mercado) que abre a conversa da cena que se está vendo, com a hora de cada fala, ao vivo; um clique numa fala leva o mapa até quem falou. Cada um vê só o que pode ver, como nos balões.
- O Mestre sem token selecionado fala num **balão sem nome** no meio da tela, como a voz do mundo; `*ação*` sem token sai em bege, também sem nome. No histórico, essas falas aparecem como "Mestre".
- Quem fala sem token na cena (um jogador cujo token não está no mapa, um personagem atribuído sem token, um sussurro sem token) ganha o balão no meio da tela, no estilo do tipo de fala.
- Ao ativar outra cena, o Mestre ativo apaga a conversa das outras cenas: o histórico recomeça a cada cena, e o registro do mundo não cresce sem fim.
- Ao abrir um mundo de antes da 0.14, o Mestre ativo leva a *Velocidade de subida* gravada no padrão antigo (35) para o novo e, se o Custom Chat Tabs estiver com as abas ligadas, pergunta uma vez se pode desligá-las.
- Com o Modo de Desempenho do Foundry em Baixo, os três pontinhos do selo de digitação param de pular.

### Alterado
- O chat lateral fica **só com as rolagens e os cartões**: o campo de digitar some, e a conversa não aparece no log nem nas notificações do canto da tela, nem acende o aviso de mensagem nova. Os botões de modo de mensagem continuam lá, só para a privacidade das rolagens.
- O texto simples é sempre fala, qualquer que seja o modo de mensagem escolhido: com token, em personagem; sem token, fora do personagem, para o jogador, e o balão sem nome, para o Mestre.
- Os balões **sobem mais devagar**: a *Velocidade de subida* padrão cai de 35 para 15 pixels por segundo, e os balões do meio da tela seguem a mesma configuração.
- O interruptor do Modo Narrador passa para o retrato da barra de conversa; o atalho Alt+N continua.
- *Ativar TBG* passa a se chamar *Ativar balões do TBG* e liga e desliga os balões; a barra e o histórico funcionam sempre. *Tempo mínimo do balão do narrador* vira *Tempo mínimo dos balões do meio da tela*.
- Guia do jogador: a página das abas virou *Histórico da cena*, e as outras falam da barra de conversa.

### Removido
- C2: as abas ON, OFF e ROLL do Custom Chat Tabs e a configuração *Abas ON, OFF e ROLL*, junto com o aviso para ligar as abas dele.
- As configurações *Falar em personagem automaticamente*, que virou o comportamento da barra, e *Agrupar mensagens consecutivas*, que só valia para as falas do chat lateral.
- O Shift+Enter, o limite e o contador no campo do chat do Foundry, que não aparece mais.

## [0.13.0] — 2026-10-18

### Adicionado
- C2: com *Abas ON, OFF e ROLL* ligada no TBG e *Enable Chat Tabs* desligada no Custom Chat Tabs (o padrão dele), o Mestre recebe ao entrar uma pergunta se pode ligá-la; aceitando, a página recarrega já com as abas. Antes, as abas simplesmente não apareciam e nada dizia por quê.

### Corrigido
- C2: com a barra lateral recolhida, o Custom Chat Tabs escondia também a notificação do canto da tela de toda mensagem fora da aba ativa. Com o ON aberto, rolagens, cartões da ficha e mensagens do OFF nunca apareciam na tela. Agora a notificação mostra toda mensagem nova, e a aba ativa filtra só o histórico.
- C2: cartões de sistema sussurrados ao Mestre sem falante, como os de rolagem privada do Mestre, caíam no OFF como conversa fora do personagem. Agora vão para o ROLL; só o sussurro digitado sem token fica no OFF.
- Cartões seguidos do mesmo falante eram agrupados como se fossem falas, e o segundo perdia o cabeçalho com o nome de quem usou. Agora só falas se agrupam.
- O contador de caracteres ocupava espaço na barra de controles do chat: para o Mestre, empurrava o botão de limpar o chat para fora da barra lateral, e com o chat no canto da tela alargava a coluna de ícones. Agora ele fica no canto inferior direito do campo do chat e, com o chat no canto da tela, logo acima dos ícones, sem ocupar espaço.

## [0.12.0] — 2026-10-12

### Alterado
- O balão nunca quebra a linha: retrato, nome e fala ficam sempre numa linha reta, por mais longa que seja a fala. O balão sobre o token cresce por igual para os dois lados a partir do meio do token, e o balão do narrador, a partir do meio da tela, mesmo quando passa da largura da área entre as colunas da interface.
- Também ficam numa linha só a mensagem que começa com `- `, `1. `, `> ` ou `# `, que o campo do chat transforma em lista, citação ou título, e o texto colado em vários parágrafos, com um espaço entre eles.
- O limite de caracteres cai de 150 para 100, fixo e igual para toda mesa e todo jogador, inclusive o Mestre.
- No guia do jogador, os exemplos e as explicações passam a mostrar o balão numa linha só.

### Removido
- A configuração *Largura máxima do balão*, que não tem mais função sem quebra de linha.

## [0.11.0] — 2026-09-21

### Adicionado
- `= texto =`: uma mensagem que começa e termina com sinal de igual sai como narração, igual ao `/n`. Só o Mestre pode narrar; para jogadores o texto é recusado com aviso.
- `/off texto` é o comando de fora do personagem, no lugar do `/ooc`: mensagem fora do personagem no chat e balão cinza e translúcido sobre o token. O `/ooc` do Foundry continua funcionando do mesmo jeito.

### Alterado
- O balão do narrador no meio da tela passa a ter o mesmo formato e tamanho dos balões dos jogadores: ícone de pergaminho no lugar do retrato, "Nome:" e texto na mesma linha, borda fina e rabinho, mas com fundo preto e letras brancas. A largura segue a *Largura máxima do balão*. Antes era um cartão escuro com borda dourada e letra grande. As configurações passam a se chamar *Balão do narrador* e *Tempo mínimo do balão do narrador*.
- O cartão da narração no chat fica igual ao das mensagens dos jogadores, com retrato e fonte normal, só com o fundo um pouco mais escuro para destacar. Saíram a fonte serifada, a borda dourada e o pergaminho antes do nome.
- O módulo não faz mais nenhuma referência a outros jogos: textos das configurações, guia, manifesto e documentação foram reescritos. A opção de empilhamento se chama só "Free flow".

## [0.10.0] — 2026-09-21

### Adicionado
- D8: guia do jogador no diário. Em *Configurações → TBG → Criar guia no diário*, o Mestre cria no mundo o diário "Guia do TBG", um tutorial de como jogar por texto com uma página por função: falar pelo personagem, modos de fala, balões, digitando, ações da ficha, abas ON/OFF/ROLL e boas práticas, com balões de exemplo desenhados com o visual real do módulo. As páginas de narração e configurações ficam visíveis só para o Mestre. Clicar de novo atualiza as páginas, mantendo pasta e permissões. O texto do guia é em pt-BR.

### Corrigido
- O manifesto dizia que o TBG repassa `/cena` para o Narrator Tools, o que nunca foi implementado (a B2 segue pendente). O motivo da recomendação agora descreve o que acontece de fato.

## [0.9.0] — 2026-09-21

### Adicionado
- C2: abas ON, OFF e ROLL no Custom Chat Tabs. Com o módulo ativo, o TBG registra as três pela API dele, abre o chat no ON e esconde as abas All, IC, OOC e Rolls. ON reúne falas, ações, pensamentos, sussurros em personagem e narração; OFF, o que é fora do personagem; ROLL, rolagens e cartões da ficha. Toda mensagem cai em uma das três, então nada some sem a aba All. Configuração `Abas ON, OFF e ROLL`.

### Alterado
- Balão mais compacto: texto de 16 px, borda de 1 px, cantos de 6 px e preenchimento de 2 px por 7 px, com o texto colado na moldura. O retrato fica num quadradinho escuro encostado na borda esquerda, e o rabinho e o balão de pensamento acompanharam a borda fina.

## [0.8.0] — 2026-09-21

### Alterado
- O retrato e o nome do balão passam a ficar na mesma linha da fala, no formato "Nome: texto", em vez de um cabeçalho em cima. A fala quebra linha por baixo conforme precisa, e uma fala curta cabe numa linha só, deixando o balão mais compacto. O retrato e o ícone do balão de uso encolheram para a altura da linha.

## [0.7.0] — 2026-09-21

### Adicionado
- B8: letreiro de narração. Toda narração do Mestre aparece também para todos no meio da tela, num cartão escuro com borda dourada que sobe devagar e some. Narrações seguidas empilham, até três, todas na mesma velocidade para nunca se sobrepor; editar uma narração reacomoda a pilha. Funciona sem cena ativa e só aparece e some quando o sistema pede movimento reduzido. Configurações `Letreiro de narração` e `Tempo mínimo do letreiro`.
- A9: balão de uso da ficha. Usar um item, uma característica ou uma rolagem pela ficha, em qualquer sistema, mostra sobre o token um balão bege com o ícone do item: "Kirito usou Espada Longa", ou "Kirito rolou Percepção". Só o nome da ação, nunca o resultado. Cartão, ataque e dano de um mesmo uso geram um balão só. Token que o jogador não vê não ganha balão, e um nome escolhido pelo Mestre, como o de um combatente renomeado, é respeitado. Configuração `Balão de uso da ficha`.

### Corrigido
- O plugin do chat entrava em todo editor de texto do Foundry, porque o core reserva a chave `chatInput` em todos. Em diários, biografias e descrições, texto acima de 150 caracteres não aceitava digitação, Shift+Enter mandava o texto inteiro para o chat como grito e esvaziava o editor, e digitar ligava o selo "digitando" no token selecionado. Agora o plugin só entra no campo do chat.
- O selo "digitando" ficava na tela enquanto houvesse texto no campo, reanunciado por outros editores. Agora ele some três segundos depois da última tecla, ao sair do campo, ao trocar de token e no Modo Narrador. O selo também nasce de forma síncrona, sem a janela em que um "parou de digitar" chegava antes dele existir e o deixava órfão.
- Cartões de sistema fora do estilo em personagem, como os sussurrados no modo de rolagem privado, e todos os que têm tipo próprio de mensagem (caso do dnd5e 6) viravam balão de sussurro ou de fala com o HTML do cartão, ou vazio. Agora não viram mais; o que for uso da ficha vira o balão de uso.

### Alterado
- Balões passam a exigir que o cliente veja o conteúdo da mensagem (`isContentVisible`), e não só a mensagem. O autor não-Mestre de uma mensagem cega deixa de ver o próprio balão, igual ao `???` que já via no chat.
- O script de verificação de `docs/TESTING.md` cobre letreiro, uso da ficha, plugin só no chat e selo parado, e conta órfãos só nos tokens de teste.

## [0.6.0] — 2026-09-20

### Corrigido
- Os balões podiam nascer todos na mesma posição, sobrepostos, em clientes onde a aba se diz visível mas não desenha. A conclusão do empurrão dependia de `document.hidden`, quando a condição real é o relógio de animação não ter dado quadros recentes.

### Alterado
- O indicador de digitação virou um selo pequeno encaixado dentro da arte do token, no canto superior direito, dimensionado como fração do token e preso a ele no zoom. Antes era um balão do tamanho de uma fala, flutuando acima do token.
- O selo passa a aparecer também para quem está digitando. O Foundry não devolve a quem envia o próprio pacote de socket, então o cliente que digita liga o selo localmente.

## [0.5.0] — 2026-09-20

### Alterado
- O limite de caracteres passa a ser fixo em 150, igual para toda mesa e todo jogador. A configuração `Limite de caracteres` deixou de existir: como o Foundry só aplica o padrão de uma setting quando o mundo nunca a gravou, e a tela de configurações grava todas de uma vez ao salvar, mundos que já tinham salvado ficavam presos ao valor antigo.

### Corrigido
- Com o campo já acima do limite, o editor recusava qualquer edição, inclusive apagar, e o histórico de mensagens antigas parava de funcionar em silêncio. Agora toda transação que encurta o texto é aceita.

## [0.4.0] — 2026-09-20

### Corrigido
- A verificação automática de colunas independentes em `docs/TESTING.md` comparava posições exatas, mas os balões sobem continuamente: ela falhava por engano sempre que a aba estivesse desenhando. Agora zera a velocidade de subida durante a checagem.

### Alterado
- O contador de caracteres passa a ser branco com contorno preto, legível sobre qualquer fundo, e vai ficando vermelho da metade do limite em diante, em vez de trocar de cor em dois degraus.
- O limite de caracteres padrão passa de 500 para 100. Mundos que já configuraram o limite mantêm o valor escolhido: o Foundry só usa o padrão de uma setting quando o mundo nunca gravou valor para ela.
- Ação (`*texto*`, `/me` e `/emote`) não repete mais o nome do personagem antes do texto. O nome continua aparecendo uma vez, no cabeçalho do cartão do chat, e o balão mostra só o que foi feito.

## [0.3.0] — 2026-09-11

### Adicionado
- Contador de caracteres ao lado dos modos de mensagem, com aviso de cor perto do limite, e limite configurável que impede digitar ou colar além do máximo (`Limite de caracteres`, zero remove o limite).
- `/ooc` passa a gerar um balão acinzentado e translúcido sobre o token de quem falou, mantendo a mensagem fora do personagem no chat.
- A5: indicador de digitação sobre o token, com três pontinhos animados, enviado por socket e apagado ao enviar, ao apagar o texto ou após cinco segundos sem sinal.

### Alterado
- O balão passa a ter cabeçalho próprio: retrato e nome lado a lado na primeira linha, fala embaixo. O nome nunca mais desce para baixo do retrato, por mais longo que seja.
- Movimento dos balões reescrito para `transform`, sem recalcular leiaute a cada quadro, com suavização independente da taxa de quadros. A velocidade padrão de subida subiu de 15 para 35 pixels por segundo.

### Corrigido
- Balões que expiravam podiam ficar órfãos no DOM e acabar duplicados na tela: a saída esperava a promessa de uma animação que não resolve enquanto a aba não desenha. A remoção agora é garantida por tempo.
- Retrato duplicado nos cartões do chat em sistemas que desenham o próprio avatar, como o dnd5e. A escolha agora é feita por CSS, que independe da ordem em que os hooks rodam.

## [0.2.1] — 2026-09-11

### Corrigido
- Os balões passam a ser reposicionados também pelo hook `refreshToken` e logo após cada empurrão, em vez de dependerem só do relógio de animação. Sem isso, a pilha e o acompanhamento do token congelavam enquanto a aba estivesse oculta, já que o navegador suspende `requestAnimationFrame` nesse estado.

### Adicionado
- Roteiro de teste manual e script de verificação automática em `docs/TESTING.md`.

## [0.2.0] — 2026-09-11

### Adicionado
- A1: motor de balões em HTML no HUD do canvas: vários balões por token, empilhamento free flow ou linha a linha, subida contínua, limite de subida, tempo máximo, escala fixa na tela ou junto com o mapa, retrato do token, atualização ao editar a mensagem.
- A3: modos de fala `/say`, `/shout` (e Shift+Enter), `/think`, `*ação*`, `/n`; `/me` e `/w` do core reconhecidos, com sussurro em personagem quando há token selecionado. Setting `autoInCharacter` (ligada por padrão): texto sem comando sai em personagem quando há token selecionado, mesmo no modo público, já que no v14 isso exigia escolher o modo "Public as Character".
- B1: Modo Narrador com botão ao lado dos modos de mensagem, atalho Alt+N, nome configurável e cartão próprio.
- C1: tema do chat com retrato do falante, cor do autor, classes por tipo de mensagem e agrupamento de mensagens consecutivas.
- Padrões de código em `docs/CODE_STANDARDS.md` e `CLAUDE.md`.

## [0.1.0] — 2026-09-11

### Adicionado
- Esqueleto do módulo para Foundry VTT 14: manifesto, ponto de entrada ESM, settings, socket `module.tbg`, query `tbg.ping`, traduções pt-BR e en, variáveis de tema `--tbg-*`.
- Briefing de funcionalidades aprovadas por fase e lista de vetadas (`docs/BRIEFING.md`).
- Decisões de arquitetura e notas da API v14 (`docs/ARCHITECTURE.md`).
- Workflow de release que gera `module.zip` e `module.json` a cada release publicada.
