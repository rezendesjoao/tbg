# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versionamento semântico.

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
