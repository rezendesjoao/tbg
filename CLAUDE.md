# TBG — instruções para o Claude Code

Módulo Foundry VTT v14 em JavaScript ESM puro, sem bundler. Antes de escrever código, ler `docs/CODE_STANDARDS.md` e segui-lo sem exceção. `docs/ARCHITECTURE.md` tem as decisões e as notas da API v14; `docs/BRIEFING.md` tem o escopo aprovado e o vetado.

## Regras fixas

- Nenhum comentário além do JSDoc de resumo e do comentário pontual de "porquê". Nada de TODO.
- Pontos de extensão oficiais do Foundry (hooks, `CONFIG`, `CHAT_COMMANDS`, eventos do core) antes de qualquer override. libWrapper só documentado em `docs/ARCHITECTURE.md`.
- Quando a documentação não bastar, ler o fonte instalado em `%LOCALAPPDATA%\Programs\Foundry Virtual Tabletop\resources\app\client` e `common`.
- Nunca reintroduzir item vetado do briefing sem decisão nova do usuário.
- pt-BR e en sempre juntos em `lang/`.

## Ambiente

- Foundry 14.367 em `http://localhost:30000`; dados em `%LOCALAPPDATA%\FoundryVTT\Data`; junction `Data\modules\tbg` aponta para esta pasta; mundo de teste `teste`.
- Verificar: `npm run lint`, `node --check` nos `.mjs`, teste manual no mundo. Mudou `module.json`: relançar o mundo.

## Commits

Conventional Commits em pt-BR, escopo igual à pasta, corpo citando o código do briefing. `CHANGELOG.md` e versão sobem no mesmo commit.
