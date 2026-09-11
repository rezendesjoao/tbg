# TBG

Módulo para **Foundry VTT v14** que transforma o chat numa experiência de *RPG de Habbo*: balões de fala que empilham sobre os tokens e sobem até sumir, um **Modo Narrador** para o Mestre falar sem estar preso a um personagem, e um chat de sidebar mais agradável de usar.

> **Estado atual: 0.1.0 — esqueleto.** O módulo carrega no Foundry 14, registra configurações, socket e traduções (pt-BR e en), mas ainda não tem funcionalidades de jogo. Tudo que vai entrar, e em que ordem, está em [docs/BRIEFING.md](docs/BRIEFING.md).

## A ideia

No Habbo, a conversa acontece **em cima do avatar**: cada frase vira um balão, o balão novo empurra os antigos para cima, e eles somem quando saem pelo topo. O ritmo da conversa é o que decide quanto tempo cada fala fica na tela. O Foundry tem balões, mas um por token, sem empilhar, sem controle nenhum.

O TBG traz isso para a mesa virtual, sem quebrar o que o Foundry já faz bem: **com um token selecionado, você fala como ele**. Em cima disso, o Mestre ganha um interruptor de **Narrador** e o chat da sidebar ganha um visual de mensageiro.

## O que vai entrar (resumo por fase)

| Fase | Entregas |
|---|---|
| 1 — Núcleo Habbo | Motor de balões empilháveis (A1) · modos de fala falar/gritar/sussurrar/pensar/ação (A3) · Modo Narrador (B1) · tema básico do chat (C1) |
| 2 — Presença e Mestre | "Digitando…" sobre o token (A5) · Diretor de cena (B4) · paleta de falantes (B3) · editar/apagar mensagem (C6) · botão IC/OOC (B7) |
| 3 — Conforto | Histórico de balões da cena (A8) · responder/citar (C7) · busca e "novas mensagens" (C9) · modo sem chat aberto (D7) · exportar diário (C10) |
| 4 — Avançado | Menções `@` (C4) · salas por Região (D3) · integração Narrator Tools (B2) · compatibilidade Custom Chat Tabs (C2) |

Detalhes, esforço estimado e a lista do que foi vetado: [docs/BRIEFING.md](docs/BRIEFING.md). Decisões técnicas e notas da API v14: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Instalação

### Para desenvolver (esta máquina)

O Foundry lê módulos de `Data/modules/<id>`. Em vez de copiar, crie uma *junction* apontando para o clone do repositório (não precisa de administrador):

```powershell
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\tbg" -Target "C:\caminho\para\tbg"
```

Depois, no Foundry: *Return to Setup* (para ele re-escanear os pacotes) → abra o mundo → *Manage Modules* → marque **TBG**. No console do navegador (F12) deve aparecer `TBG | ready`.

Dica: com `"hotReload": true` no `Config/options.json` do Foundry, mudanças em CSS, HBS e JSON de idioma aparecem sem recarregar a página.

### Para jogar (quando houver release)

Cole a URL do manifesto no instalador de módulos do Foundry:

```
https://github.com/rezendesjoao/tbg/releases/latest/download/module.json
```

Enquanto o repositório for privado, esse link só funciona para quem tem acesso. Alternativa: baixe o `module.zip` da release e extraia em `Data/modules/tbg`.

## Compatibilidade

- Foundry VTT **14** (testado em 14.367). Não roda em v13: usa `ChatLog.CHAT_COMMANDS`, `CONFIG.ChatMessage.modes` e o input ProseMirror, que são novidades do v14.
- Agnóstico de sistema. Testado com dnd5e, Daggerheart e OP RPG.
- Sem dependências obrigatórias. Recomendados (o TBG não duplica o que eles fazem): Narrator Tools, Custom Chat Tabs, Cautious Gamemaster's Pack.

## Estrutura

```
module.json          manifesto v14
scripts/tbg.mjs      ponto de entrada (hooks init/ready, API pública)
scripts/constants.mjs, utils.mjs, settings.mjs, sockets.mjs
styles/tbg.css       variáveis de tema (--tbg-*)
lang/                en.json, pt-BR.json
templates/           Handlebars (vazio por enquanto)
docs/                briefing aprovado e arquitetura
.github/workflows/   release: gera module.zip + module.json por tag
```

## Desenvolvimento

```bash
npm install
npm run lint
```

JavaScript ESM puro, sem bundler: o Foundry carrega `scripts/tbg.mjs` direto. ApplicationV2 e zero jQuery. CSS na layer `modules` do Foundry, então nada de `!important`.

## Licença

MIT. Veja [LICENSE](LICENSE).
