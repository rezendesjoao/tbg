# TBG

Módulo para **Foundry VTT v14** feito para jogar RPG por texto, no jeito das salas de bate-papo dos jogos: uma **barra de conversa** no pé da tela, balões de fala que empilham sobre os tokens e sobem devagar até sumir, o **Histórico da cena** para reler o que foi dito e um **Modo Narrador** para o Mestre.

> **Estado: 0.14.1.** A conversa saiu do chat lateral: escreve-se na barra do pé da tela (D7), o chat lateral fica só com as rolagens e os cartões, e o Histórico da cena (A8) guarda a conversa de cada cena até o Mestre ativar outra. O Mestre sem token narra. Antes disso já estavam o motor de balões (A1), os modos de fala (A3), o Modo Narrador (B1), o tema do chat (C1), o indicador de digitação (A5), o balão do narrador (B8), o balão de uso da ficha (A9) e o guia no diário (D8). O resto está em [docs/BRIEFING.md](docs/BRIEFING.md).

## Como funciona

A **barra de conversa** fica no pé da tela, acima da barra de macros ou do que tomou o lugar dela (o HUD da Eternia, por exemplo). Com um token selecionado, você fala como ele; o retrato no começo da barra mostra por quem você vai falar. Cada fala vira um balão compacto acima do token: borda fina, texto colado na moldura e o retrato e o nome na mesma linha da fala: "Nome: fala". O balão nunca quebra: é sempre uma linha só, centrada no token, que cresce por igual para os dois lados. O balão novo nasce embaixo e empurra os anteriores; um relógio sobe todos devagar (15 pixels por segundo, para dar tempo de ler); quem passa do limite some. No empilhamento *Free flow*, o padrão, balões de tokens distantes não se empurram, então cada grupo de conversa forma a própria coluna.

| Tecla na barra | O que faz |
|---|---|
| **Enter** | Fala. Com o mapa em foco, leva o cursor para a barra |
| **Shift+Enter** | Grita |
| **↑** e **↓** | Trazem de volta o que você já mandou |
| **Esc** | Sai da barra, sem soltar o token |

Quem fala sem token na cena ganha o balão no meio da tela: o **Mestre sem token selecionado narra**, no balão do narrador; um jogador sem token fala fora do personagem, num balão cinza com o nome dele. Comandos do Mestre sem token, como `*ação*`, saem num balão sem nome. Os botões de modo de mensagem do Foundry continuam no chat lateral, mas só escolhem quem vê as rolagens: o texto da barra sai sempre para a mesa, e o segredo vai por sussurro.

### Modos de fala

| Como | O que acontece |
|---|---|
| Texto normal com token selecionado | Fala: balão normal |
| Texto normal, Mestre sem token | Narração: o balão do narrador no meio da tela |
| `/shout texto` ou **Shift+Enter** | Grito: negrito, balão maior |
| `/think texto` (ou `/pensar`) | Pensamento: balão-nuvem só para o Mestre e o dono |
| `*texto*` ou `/me texto` | Ação: balão em itálico, só o que foi feito, sem o nome antes |
| `/w Nome texto` ou `/w [Nome Composto] texto` | Sussurro: balão itálico só para quem recebe |
| `/say texto` (ou `/falar`) | Fala, como o texto normal |
| `/n texto` (ou `/narrar`) ou `= texto =` | Narração pontual (só Mestre) |
| `/off texto` | Fora do personagem: balão acinzentado e translúcido. O `/ooc` do Foundry continua funcionando do mesmo jeito |

### O chat lateral e o Histórico da cena

O campo de digitar do chat lateral some: ninguém escreve nele. O chat fica só com a mecânica, as rolagens e os cartões da ficha, e a conversa nem chega a ele (nem nas notificações do canto da tela).

O botão **Histórico da cena**, na barra de ferramentas dos tokens, abre a conversa da cena que você está vendo, da mais antiga à mais nova, com a hora de cada fala: falas, narração, o que foi dito fora do personagem e os sussurros e pensamentos que você pode ver. A janela acompanha a conversa ao vivo e desce sozinha quando já estava no fim; um clique numa fala leva o mapa até quem falou. Na Eternia, o botão fica logo abaixo do Mercado. Quando o Mestre ativa outra cena, a conversa das outras cenas é apagada, e o histórico recomeça.

### Contador de caracteres e digitação

No fim da barra, um contador mostra quanto você já escreveu. O teto é de **130 caracteres**, igual para toda mesa e todo jogador, Mestre incluído, e o contador vai ficando vermelho da metade do limite em diante. No limite a barra para de aceitar texto, inclusive colado, mas apagar continua sempre possível.

Enquanto alguém escreve na barra, um selo pequeno com três pontinhos aparece dentro da arte do token, no canto superior direito. Ele aparece para todo mundo, inclusive para quem está digitando, e acompanha o token no zoom. Some ao enviar, ao apagar o texto, ao sair da barra ou após três segundos sem digitar.

### Modo Narrador

Sem token selecionado, o Mestre sempre narra: o texto sem comando sai como "Narrador", no balão do narrador, e o começo da barra mostra um pergaminho. Para narrar também com um token selecionado, clique no retrato do começo da barra ou use **Alt+N**. Para uma narração avulsa sem ligar o modo, use `/n texto` ou escreva a frase entre sinais de igual: `= A neblina desce sobre a vila =`. Só o Mestre narra; um jogador que tentar recebe o aviso "Só o Mestre pode narrar." O nome do narrador é configurável.

### Balões no meio da tela

Toda narração aparece para todos num balão no meio da tela, com o mesmo formato e tamanho dos balões dos jogadores, mas com fundo preto, letras brancas e um pergaminho no quadradinho do retrato. A conversa sem token (um jogador sem token na cena, um comando do Mestre sem token) usa o mesmo lugar, no estilo do tipo de fala. Os balões nascem um pouco abaixo do centro, sobem na velocidade dos balões dos tokens e somem; textos longos ficam mais tempo, até 30 segundos. Empilham até três na tela e funcionam mesmo sem cena ativa; com o movimento reduzido do sistema ou o modo fotossensível do Foundry, só aparecem e somem.

### Balão de uso da ficha

Quando alguém usa um item, uma característica ou uma rolagem pela ficha, em qualquer sistema, aparece sobre o token um balão bege com o ícone do item: "Kirito usou Espada Longa", ou "Kirito rolou Percepção" para rolagens sem item. Só o nome da ação, nunca o resultado. Um uso que gera várias mensagens (cartão, ataque, dano) mostra um balão só, e rolagens privadas ou cegas só aparecem para quem pode ver o cartão.

### Guia do jogador

Em *Configurações → TBG → Criar guia no diário*, o Mestre cria no mundo o diário **Guia do TBG**: um tutorial ilustrado de como jogar por texto, com uma página por função do módulo e balões de exemplo com o visual real. Os jogadores veem as páginas deles; as de narração e configurações ficam só para o Mestre. Clicar de novo atualiza o guia para a versão do módulo instalada.

### Configurações

Mundo: interruptor dos balões, mostrar quem está digitando, balão de uso da ficha, balão do narrador e o tempo mínimo dos balões do meio da tela, layout dos balões (free flow ou linha a linha), velocidade de subida (15 por padrão), limite de subida, tempo máximo, retrato no balão, nome do narrador. Cliente: escala dos balões (tamanho fixo na tela ou junto com o mapa), tema do chat, log de debug. Teclas: **Enter** (ir para a barra de conversa) e **Alt+N** (Modo Narrador).

Ao abrir um mundo de antes da 0.14 pela primeira vez, o Mestre ativo leva a velocidade de subida gravada no padrão antigo (35) para o novo e, se o Custom Chat Tabs estiver com as abas ligadas, pergunta uma vez se pode desligá-las.

## Instalação

### Para desenvolver

O Foundry lê módulos de `Data/modules/<id>`. Crie uma *junction* apontando para o clone (não precisa de administrador):

```powershell
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\tbg" -Target "C:\caminho\para\tbg"
```

Depois: *Return to Setup* → abra o mundo → *Manage Modules* → marque **TBG**. No console (F12) aparece `TBG | TBG 0.14.1 pronto`.

Com `"hotReload": true` no `Config/options.json` do Foundry, mudanças em CSS, HBS e JSON de idioma aparecem sem recarregar.

### Para jogar

URL do manifesto no instalador de módulos:

```
https://github.com/rezendesjoao/tbg/releases/latest/download/module.json
```

Enquanto o repositório for privado, o link só funciona para quem tem acesso.

## Compatibilidade

- Foundry VTT **14** (testado em 14.367). Não roda em v13.
- Agnóstico de sistema. Sem dependências obrigatórias. Recomendados: Narrator Tools, Cautious Gamemaster's Pack.
- Na Eternia, o botão do histórico entra logo abaixo do Mercado e a barra fica acima do HUD; o visual de pergaminho vem do próprio sistema.
- API: `game.modules.get("tbg").api` expõe `say(token, html, { kind })`, `narrate(html)`, `toggleNarrator()`, `isEnabled()` e `KINDS`.

## Desenvolvimento

```bash
npm install
npm run lint
```

Padrões em [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md); decisões em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Licença

MIT. Veja [LICENSE](LICENSE).
