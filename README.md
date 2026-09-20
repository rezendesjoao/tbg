# TBG

Módulo para **Foundry VTT v14** que transforma o chat numa experiência de *RPG de Habbo*: balões de fala que empilham sobre os tokens e sobem até sumir, um **Modo Narrador** para o Mestre falar sem estar preso a um personagem, e um chat de sidebar com cara de mensageiro.

> **Estado: 0.6.0.** Fase 1 completa: motor de balões (A1), modos de fala (A3), Modo Narrador (B1) e tema do chat (C1). Da Fase 2 já entrou o indicador de digitação sobre o token (A5). O que vem depois está em [docs/BRIEFING.md](docs/BRIEFING.md).

## Como funciona

Com um token selecionado, você fala como ele. No v14 o Foundry só faz isso no modo "Public as Character"; a setting **Falar em personagem automaticamente** (ligada por padrão) faz o texto simples sair em personagem também no modo público, sem mexer no seletor de modos. Cada fala vira um balão acima do token. O balão novo nasce embaixo e empurra os anteriores para cima; um relógio sobe todos devagar; quem passa do limite some. Balões de tokens distantes não se empurram, então cada grupo de conversa forma a própria coluna, como no Free Flow Chat do Habbo.

### Modos de fala

| Como | O que acontece |
|---|---|
| Texto normal com token selecionado | Fala: balão normal |
| `/shout texto` ou **Shift+Enter** | Grito: negrito, balão maior |
| `/think texto` (ou `/pensar`) | Pensamento: balão-nuvem só para o Mestre e o dono |
| `*texto*` ou `/me texto` | Ação: balão em itálico, só o que foi feito, sem o nome antes |
| `/w Nome texto` | Sussurro em personagem: balão itálico só para quem recebe |
| `/say texto` (ou `/falar`) | Fala explícita, mesmo com outro modo ativo |
| `/n texto` (ou `/narrar`) | Narração pontual (só Mestre) |
| `/ooc texto` | Fora do personagem: balão acinzentado e translúcido |

### Contador de caracteres e digitação

Ao lado dos modos de mensagem fica um contador que mostra quanto você já escreveu. O teto é de **150 caracteres**, igual para toda mesa e todo jogador, sem configuração que possa divergir. O contador é branco com contorno preto, para se ler sobre qualquer fundo, e vai ficando vermelho da metade do limite em diante. No limite o editor para de aceitar texto, inclusive colado, mas apagar continua sempre possível.

Enquanto alguém escreve, um selo pequeno com três pontinhos aparece dentro da arte do token, no canto superior direito. Ele aparece para todo mundo, inclusive para quem está digitando, e acompanha o token no zoom. Some ao enviar, ao apagar o texto ou após cinco segundos de silêncio.

### Modo Narrador

Botão 📜 ao lado dos modos de mensagem, ou **Alt+N**. Ligado, tudo que o Mestre digita sem comando sai como "Narrador" num cartão próprio, sem balão. Desligado, volta ao normal. O nome do narrador é configurável.

### Configurações

Mundo: interruptor geral, falar em personagem automaticamente, mostrar quem está digitando, layout dos balões (free flow ou linha a linha), velocidade de subida, limite de subida, largura máxima, tempo máximo, retrato no balão, nome do narrador. Cliente: escala dos balões (tamanho fixo na tela ou junto com o mapa), tema do chat, agrupamento de mensagens consecutivas, log de debug.

## Instalação

### Para desenvolver

O Foundry lê módulos de `Data/modules/<id>`. Crie uma *junction* apontando para o clone (não precisa de administrador):

```powershell
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\tbg" -Target "C:\caminho\para\tbg"
```

Depois: *Return to Setup* → abra o mundo → *Manage Modules* → marque **TBG**. No console (F12) aparece `TBG | TBG 0.6.0 pronto`.

Com `"hotReload": true` no `Config/options.json` do Foundry, mudanças em CSS, HBS e JSON de idioma aparecem sem recarregar.

### Para jogar

URL do manifesto no instalador de módulos:

```
https://github.com/rezendesjoao/tbg/releases/latest/download/module.json
```

Enquanto o repositório for privado, o link só funciona para quem tem acesso.

## Compatibilidade

- Foundry VTT **14** (testado em 14.367). Não roda em v13.
- Agnóstico de sistema. Sem dependências obrigatórias. Recomendados: Narrator Tools, Custom Chat Tabs, Cautious Gamemaster's Pack.
- API: `game.modules.get("tbg").api` expõe `say(token, html, { kind })`, `narrate(html)`, `toggleNarrator()`, `isEnabled()` e `KINDS`.

## Desenvolvimento

```bash
npm install
npm run lint
```

Padrões em [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md); decisões em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Licença

MIT. Veja [LICENSE](LICENSE).
