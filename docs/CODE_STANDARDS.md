# Padrões de código do TBG

Objetivo: um módulo pequeno, legível e cirúrgico. Cada arquivo faz uma coisa, cada função cabe na tela, o código explica a si mesmo.

## 1. Fonte da verdade

- A API é a documentação oficial do Foundry v14 (https://foundryvtt.com/api/) e o código-fonte instalado em `resources/app/client` e `resources/app/common`. Em dúvida, ler o fonte; nunca adivinhar.
- Usar sempre os namespaces oficiais: `foundry.applications.api.ApplicationV2`, `foundry.applications.sidebar.tabs.ChatLog`, `foundry.applications.ux.TextEditor.implementation`, `foundry.applications.handlebars.renderTemplate`, `foundry.utils.*`, `foundry.prosemirror.*`. Nada de globais deprecados nem shims de versão: o módulo é v14+.
- Pontos de extensão oficiais antes de qualquer override: hooks (`hookEvents`), `CONFIG.*`, `ChatLog.CHAT_COMMANDS`, eventos DOM do core (`plugins` do `<prose-mirror>`, `renderChatInput`). libWrapper só com justificativa escrita em `docs/ARCHITECTURE.md`.

## 2. Comentários

- Permitido: um bloco JSDoc de resumo (uma frase, mais `@param`/`@returns` só quando o tipo não é óbvio) em classes, funções e constantes exportadas.
- Permitido: um comentário de uma linha quando o *porquê* não é dedutível do código: contorno de bug do core (com link da issue), ordem obrigatória entre hooks, constante vinda de fora (por exemplo, valores medidos no Habbo).
- Proibido: comentar o *o quê* (`// incrementa o contador`), separadores decorativos, código comentado, `TODO`/`FIXME` (vira issue no GitHub).
- Se um comentário foi necessário para explicar o fluxo, o código precisa de um nome melhor ou de uma função menor.

## 3. Nomes

- `camelCase` para variáveis e funções, `PascalCase` para classes, `UPPER_SNAKE_CASE` para constantes exportadas.
- Nomes completos, sem abreviação: `message`, não `msg`; `bubble`, não `b`. Booleanos começam com `is`, `has`, `can` ou `show`.
- Função que faz algo é verbo (`resolveKind`, `mountLayer`); função que devolve algo é substantivo (`speakerToken`, `narratorName`).
- Prefixo `tbg-` em todo id e classe CSS; variáveis CSS `--tbg-*`; chaves i18n `TBG.Dominio.item`; flags em `flags.tbg.*`; settings em `camelCase` curto.

## 4. Estrutura

- `scripts/tbg.mjs` só orquestra: importa e chama `register…()` de cada domínio no hook certo. Nenhuma lógica lá.
- Um domínio por pasta (`bubbles/`, `chat/`), um assunto por arquivo, poucas exportações nomeadas por arquivo.
- Funções curtas (até cerca de 25 linhas), uma responsabilidade, retorno cedo, sem aninhamento profundo.
- Até três parâmetros posicionais; além disso, um objeto de opções com destructuring e defaults.
- Sem estado global além de `game.modules.get("tbg").api`. Estado vive em instâncias ou em campos `#private`.
- Sem código morto, sem `export` que ninguém importa, sem utilitário "para o futuro".

## 5. Dados e sincronização

- Persistente: `flags.tbg.*` em documentos (o Foundry sincroniza) ou `game.settings`.
- Efêmero: socket `module.tbg`. Pedido e resposta: `CONFIG.queries`.
- Guardar ids, não documentos; resolver o documento na hora de usar.
- Settings: `world` para regras da mesa, `client` para preferência visual. Tipo, `range` e `choices` explícitos.

## 6. Interface e CSS

- ApplicationV2 com HandlebarsApplicationMixin; DialogV2; zero jQuery; DOM nativo (`querySelector`, `append`, `classList`, `dataset`).
- Handlebars em `templates/`. HTML em string JS só para um elemento trivial. Conteúdo vindo do usuário passa por `enrichHTML` ou `escapeHTML`; nunca `innerHTML` com texto cru.
- CSS entra sozinho na layer `modules`: sem `!important`, sem seletor por id do core além dos pontos de montagem (`#hud`, `#ui-middle`, `#message-modes`, `#chat-message`).
- Movimento contínuo com `requestAnimationFrame`; transição pontual com `Element.animate`. Medir DOM uma vez, fora do loop.

## 7. Erros e logs

- Erro do usuário: `throw new Error(localize(...))` (o core exibe a notificação). Erro de programação: `console.error("TBG |", …)`.
- Nunca `catch` vazio. `debug()` só com a setting de debug ligada.
- Toda mensagem visível ao usuário vem de `lang/`, com pt-BR e en no mesmo commit.

## 8. Compatibilidade

- Alvo: Foundry 14 estável (`compatibility.minimum: 14`, sem `maximum`). Sem `isV13()`.
- Agnóstico de sistema: só campos do core (`name`, `img`, `texture.src`, `color`). Nada de `actor.system.*`.
- Exceção única: o resolvedor do balão de uso (`chat/usage-item.mjs`) lê `message.system` e as flags de outros pacotes de forma genérica, procurando ids e UUIDs de item sem conhecer nenhuma chave de sistema.
- Coexistir com Narrator Tools, Custom Chat Tabs e CGMP: nunca desligar recurso alheio; marcar mensagens com `flags.tbg.kind` e classes `tbg-kind-*` para que eles filtrem.

## 9. Verificação e commits

- Antes de commitar: `npm run lint` limpo, `node --check` em cada `.mjs`, teste manual no mundo `teste` seguindo a checklist do item em `docs/BRIEFING.md`.
- Conventional Commits em pt-BR, escopo igual à pasta: `feat(bubbles): empilhamento free flow`, `fix(chat): …`, `docs: …`, `chore: …`. O corpo cita o código do briefing (A1, B1).
- `CHANGELOG.md` e a versão em `module.json` e `package.json` mudam no mesmo commit da funcionalidade.
