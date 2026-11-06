# TBG

Módulo para **Foundry VTT v14** feito para jogar RPG por texto, no jeito das salas de bate-papo dos jogos: uma **barra de conversa** no pé da tela, balões de fala numa faixa no topo da tela, que empilham sem se sobrepor e sobem aos pulos até sumir, o **Histórico da cena** para reler o que foi dito e um **Modo Narrador** para o Mestre.

> **Estado: 0.16.1.** Os balões saem de uma faixa presa ao topo da tela: todos nascem na mesma linha, na direção de quem fala, se empurram sem nunca se sobrepor (os dos tokens, o do narrador e o do uso da ficha) e sobem aos pulos, uma linha por vez, até sumir. Desde a 0.14, a conversa saiu do chat lateral: escreve-se na barra do pé da tela (D7), o chat lateral fica só com as rolagens e os cartões, e o Histórico da cena (A8) guarda toda a conversa: os jogadores veem a da cena desde que o Mestre a ativou, e o Mestre vê tudo e exporta em JSON. O Mestre sem token narra. Antes disso já estavam o motor de balões (A1), os modos de fala (A3), o Modo Narrador (B1), o tema do chat (C1), o indicador de digitação (A5), o balão do narrador (B8), o balão de uso da ficha (A9) e o guia no diário (D8). O resto está em [docs/BRIEFING.md](docs/BRIEFING.md).

## Como funciona

A **barra de conversa** fica no pé da tela, acima da barra de macros ou do que tomou o lugar dela (o HUD da Eternia, por exemplo). Com um token selecionado, você fala como ele; o retrato no começo da barra mostra por quem você vai falar. Cada fala vira um balão compacto: borda fina, texto colado na moldura e o retrato e o nome na mesma linha da fala: "Nome: fala". O balão nunca quebra: é sempre uma linha só, que cresce por igual para os dois lados.

Os balões moram numa **faixa no topo da tela**, como nas salas de bate-papo dos jogos. Todo balão nasce na mesma linha (a 200 pixels do topo, no padrão, e nunca abaixo do meio da tela), na direção do token que fala, e empurra para cima os balões em que encosta: ninguém fica por cima de ninguém. Em vez de subir sem parar, os balões ficam parados e, de tempos em tempos, pulam todos juntos uma linha, num movimento curto (no padrão, mais ou menos a cada dois segundos); o recém-nascido espera um instante antes do primeiro pulo, e quem passa do topo some. O balão fica onde foi dito, mesmo que o token ande depois, e acompanha o mapa só na horizontal quando você o arrasta; o tamanho é sempre o mesmo, em qualquer zoom. No empilhamento *Free flow*, o padrão, balões de tokens distantes não se empurram, então cada grupo de conversa forma a própria coluna; em *Linha a linha*, cada balão novo empurra a faixa inteira. Nada roda a cada quadro: os pulos são transições curtas, imediatas no Modo de Desempenho Baixo do Foundry.

| Tecla na barra | O que faz |
|---|---|
| **Enter** | Fala. Com o mapa em foco, leva o cursor para a barra |
| **Shift+Enter** | Grita |
| **↑** e **↓** | Trazem de volta o que você já mandou |
| **Esc** | Sai da barra, sem soltar o token |

Quem fala sem token na cena ganha o balão no meio da faixa: o **Mestre sem token selecionado narra**, no balão do narrador; um jogador sem token fala fora do personagem, num balão translúcido com o nome dele. Comandos do Mestre sem token, como `/shout` e `/w`, saem num balão sem nome. Se o Mestre for falar pelo token de um personagem de jogador, a barra pergunta antes (dá para não perguntar mais por aquele personagem até recarregar). Os botões de modo de mensagem do Foundry continuam no chat lateral, mas só escolhem quem vê as rolagens: o texto da barra sai sempre para a mesa, e o segredo vai por sussurro.

### Modos de fala

| Como | O que acontece |
|---|---|
| Texto normal com token selecionado | Fala: balão normal |
| Texto normal, Mestre sem token | Narração: o balão do narrador no meio da faixa |
| `/shout texto` ou **Shift+Enter** | Grito: negrito, balão maior |
| `/think texto` (ou `/pensar`) | Pensamento: balão-nuvem só para o Mestre e o dono |
| `*texto*` ou `'texto'`, sozinho ou no meio da fala | Ação: as marcas somem e a ação sai em negrito no mesmo balão, como em `Tem certeza? *aponta a lâmina*`. O `/me texto` do Foundry vira uma ação inteira |
| `/w Nome texto` ou `/w [Nome Composto] texto` | Sussurro: balão itálico só para quem recebe |
| `/say texto` (ou `/falar`) | Fala, como o texto normal |
| `/n texto` (ou `/narrar`) ou `= texto =` | Narração pontual (só Mestre) |
| `[texto]` ou `texto []` | Fora do personagem: o balão comum, translúcido, com o nome do jogador. O `/ooc` do Foundry continua funcionando do mesmo jeito |

### O chat lateral e o Histórico da cena

O campo de digitar do chat lateral some: ninguém escreve nele. O chat fica só com a mecânica, as rolagens e os cartões da ficha, e a conversa nem chega a ele (nem nas notificações do canto da tela).

O botão **Histórico da cena**, na barra de ferramentas dos tokens, abre a conversa da cena que você está vendo, da mais antiga à mais nova, com a hora de cada fala: falas, narração, o que foi dito fora do personagem e os sussurros e pensamentos que você pode ver. A janela acompanha a conversa ao vivo e desce sozinha quando já estava no fim; um clique numa fala leva o mapa até quem falou. Na Eternia, o botão fica logo abaixo do Mercado. Nada é apagado: quando o Mestre ativa outra cena, o histórico dos jogadores recomeça; o do Mestre mostra a cena inteira, tem o botão *Todas as cenas* e exporta a conversa em JSON. O Mestre também pode apagar falas: o botão de seleção marca uma a uma (Shift+clique marca um trecho), as das últimas 24 horas ou todas, e *Apagar* as tira de vez, depois de confirmar.

### Contador de caracteres e digitação

No fim da barra, um contador mostra quanto você já escreveu. O teto é de **130 caracteres**, igual para toda mesa e todo jogador, Mestre incluído, e o contador vai ficando vermelho da metade do limite em diante. No limite a barra para de aceitar texto, inclusive colado, mas apagar continua sempre possível.

Enquanto alguém escreve na barra, um selo pequeno com três pontinhos aparece dentro da arte do token, no canto superior direito. Ele aparece para todo mundo, inclusive para quem está digitando, e acompanha o token no zoom. Some ao enviar, ao apagar o texto, ao sair da barra ou após três segundos sem digitar.

### Modo Narrador

Sem token selecionado, o Mestre sempre narra: o texto sem comando sai como "Narrador", no balão do narrador, e o começo da barra mostra um pergaminho. Para narrar também com um token selecionado, clique no retrato do começo da barra ou use **Alt+N**. Para uma narração avulsa sem ligar o modo, use `/n texto` ou escreva a frase entre sinais de igual: `= A neblina desce sobre a vila =`. Só o Mestre narra; um jogador que tentar recebe o aviso "Só o Mestre pode narrar." O nome do narrador é configurável.

### O narrador na faixa

Toda narração aparece para todos num balão no meio da faixa, na mesma linha onde nascem os outros, com o mesmo formato e tamanho dos balões dos jogadores, mas com fundo preto, letras brancas e um pergaminho no quadradinho do retrato. A conversa sem token (um jogador sem token na cena, um comando do Mestre sem token) também nasce no meio, no estilo do tipo de fala. Todos colidem com os balões dos tokens como qualquer outro. O balão do narrador pula mais devagar que os outros (no padrão, uma vez a cada dois pulos), para ficar pelo menos 30 segundos quando nada o empurra, mesmo com um *Tempo máximo* menor. Funciona mesmo sem cena ativa.

### Balão de uso da ficha

Quando alguém usa um item, uma característica ou uma rolagem pela ficha, em qualquer sistema, aparece na faixa, na direção do token, um balão bege com o ícone do item: "Kirito usou Espada Longa", ou "Kirito rolou Percepção" para rolagens sem item. Só o nome da ação, nunca o resultado. Um uso que gera várias mensagens (cartão, ataque, dano) mostra um balão só, e rolagens privadas ou cegas só aparecem para quem pode ver o cartão.

### Guia do jogador

Em *Configurações → TBG → Criar guia no diário*, o Mestre cria no mundo o diário **Guia do TBG**: um tutorial ilustrado de como jogar por texto, com uma página por função do módulo e balões de exemplo com o visual real. Os jogadores veem as páginas deles; as de narração e configurações ficam só para o Mestre. Clicar de novo atualiza o guia para a versão do módulo instalada.

### Configurações

Mundo: interruptor dos balões, mostrar quem está digitando, balão de uso da ficha, balão do narrador, layout dos balões (free flow ou linha a linha), velocidade de subida (15 por padrão, em pixels por segundo, na média dos pulos), altura da faixa (200 por padrão), tempo máximo, retrato no balão, nome do narrador. Cliente: tema do chat, log de debug. Teclas: **Enter** (ir para a barra de conversa) e **Alt+N** (Modo Narrador).

Ao abrir um mundo de antes da 0.14 pela primeira vez, o Mestre ativo leva a velocidade de subida gravada no padrão antigo (35) para o novo e, se o Custom Chat Tabs estiver com as abas ligadas, pergunta uma vez se pode desligá-las.

## Instalação

### Para desenvolver

O Foundry lê módulos de `Data/modules/<id>`. Crie uma *junction* apontando para o clone (não precisa de administrador):

```powershell
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\tbg" -Target "C:\caminho\para\tbg"
```

Depois: *Return to Setup* → abra o mundo → *Manage Modules* → marque **TBG**. No console (F12) aparece `TBG | TBG 0.15.0 pronto`.

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
