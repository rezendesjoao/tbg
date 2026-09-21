# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versionamento semântico.

## [0.9.0] — 2026-09-21

### Adicionado
- C2: abas ON, OFF e ROLL no Custom Chat Tabs. Com o módulo ativo, o TBG registra as três pela API dele, abre o chat no ON e esconde as abas All, IC, OOC e Rolls. ON reúne falas, ações, pensamentos, sussurros em personagem e narração; OFF, o que é fora do personagem; ROLL, rolagens e cartões da ficha. Toda mensagem cai em uma das três, então nada some sem a aba All. Configuração `Abas ON, OFF e ROLL`.

### Alterado
- Balão mais compacto, como o do Habbo: texto de 16 px, borda de 1 px, cantos de 6 px e preenchimento de 2 px por 7 px, com o texto colado na moldura. O retrato fica num quadradinho escuro encostado na borda esquerda, e o rabinho e o balão de pensamento acompanharam a borda fina.

## [0.8.0] — 2026-09-21

### Alterado
- O retrato e o nome do balão passam a ficar na mesma linha da fala, no formato "Nome: texto" do Habbo, em vez de um cabeçalho em cima. A fala quebra linha por baixo conforme precisa, e uma fala curta cabe numa linha só, deixando o balão mais compacto. O retrato e o ícone do balão de uso encolheram para a altura da linha.

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
