# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versionamento semântico.

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
