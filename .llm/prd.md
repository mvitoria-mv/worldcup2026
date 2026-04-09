# PRD: Site Copa do Mundo 2026

## Objetivo

Site informativo e estatístico sobre a Copa do Mundo 2026, com acompanhamento de próximos jogos. Público-alvo duplo: fã casual (interface simples, foco em jogos) e entusiasta de futebol (estatísticas detalhadas, histórico, comparativos).

## Tecnologia

- HTML/CSS/JS puro. Mobile-first.
- Arquitetura: shell único (`index.html`) com conteúdo dinâmico via ES Modules nativos
- Roteamento por `#hash` sem framework ou bundler
- Dados estáticos em JSON coletados do site da FIFA e fontes confiáveis
- Requer servidor HTTP local para desenvolvimento (ex: `npx live-server`)

## Tema Visual

Vibrant / Copa 2026 — gradiente vermelho (`#BF0A30`) e azul (`#002868`) com acentos dourados (`#FFD700`). Fundo escuro (`#0d0a1e`).

## Navegação

Top Tabs com scroll horizontal (padrão Google/YouTube Mobile). Abas fixas abaixo do header, todas as 7 seções acessíveis.

**Ordem:** Home · Jogos · Grupos · Seleções · Estatísticas · Histórico · Sedes

## Seções

### Home (`#home`)
- Banner compacto com o próximo jogo agendado (times, data, hora, estádio)
- Feed cronológico de jogos agrupados por dia ("Hoje", "Amanhã", datas futuras)
- Jogos passados exibem placar; agendados exibem horário
- Filtro rápido por fase: Grupos / Oitavas / Quartas / Semifinal / Final

### Jogos (`#jogos`)
- Calendário completo dos 104 jogos
- Filtros: por fase, por grupo, por seleção, por sede
- Card por jogo: bandeiras, placar ou horário, estádio, cidade

### Grupos (`#grupos`)
- Grid com os 12 grupos (A–L)
- Tabela por grupo: Seleção, J, V, E, D, GP, GC, SG, Pts
- Destaque visual para os 2 classificados de cada grupo

### Seleções (`#selecoes`)
- Lista das 48 seleções com bandeira e grupo
- Detalhe por seleção: elenco, stats do torneio, histórico de Copas, confrontos diretos históricos

### Estatísticas (`#estatisticas`)
- Artilharia: ranking de goleadores (nome, seleção, clube, gols)
- Stats por seleção: gols marcados/sofridos, finalizações, posse
- Stats individuais por jogador: assistências, passes, defesas (filtrado por posição)
- Comparativo head-to-head: ferramenta livre para comparar stats de 2 seleções lado a lado

### Histórico (`#historico`)
- Timeline de todas as Copas (1930–2022)
- Card por edição: sede, campeão, vice, 3º lugar, artilheiro, total de gols
- Ranking histórico de títulos por seleção
- Recordes: maior goleada, mais gols numa edição, artilheiro histórico

### Sedes (`#sedes`)
- Cards dos 16 estádios: nome, cidade, país, capacidade, nº de jogos
- Agrupados por país: EUA / México / Canadá

## Estrutura de Arquivos

```
WorldCups_02/
├── index.html
├── styles/
│   ├── main.css
│   ├── nav.css
│   └── components.css
├── sections/
│   ├── home.js
│   ├── jogos.js
│   ├── grupos.js
│   ├── selecoes.js
│   ├── estatisticas.js
│   ├── historico.js
│   └── sedes.js
├── data/
│   ├── jogos.json
│   ├── grupos.json
│   ├── selecoes.json
│   ├── artilharia.json
│   ├── historico.json
│   └── sedes.json
└── js/
    ├── router.js
    └── utils.js
```

## Schema dos Dados

### `jogos.json`
Campos por jogo: `id`, `fase`, `grupo`, `data`, `hora`, `sede`, `cidade`, `pais_sede`, `time_a`, `time_b`, `placar_a`, `placar_b`, `status` (`"agendado"` | `"encerrado"`)

### `selecoes.json`
Campos por seleção: `codigo`, `nome`, `grupo`, `bandeira`, `titulos_copa`, `anos_titulo`, `elenco[]`, `stats_torneio`

### `historico.json`
Campos por Copa: `ano`, `sede`, `campeao`, `vice`, `terceiro`, `artilheiro`, `total_gols`, `total_jogos`

### `sedes.json`
Campos por sede: `id`, `estadio`, `cidade`, `pais`, `capacidade`, `jogos`

### `grupos.json`
Campos: lista de grupos com seleções e tabela de classificação

### `artilharia.json`
Campos por jogador: `nome`, `selecao`, `clube`, `gols`, `assistencias`

## Critérios de Sucesso

- Todas as 7 seções carregam sem erros no console
- Filtros de jogos funcionam corretamente
- Comparativo head-to-head exibe stats corretas entre 2 seleções
- Layout legível em telas de 375px de largura (mobile-first)
- Dados validados da FIFA e fontes confiáveis

## Referência

Design spec completo: `docs/superpowers/specs/2026-04-08-worldcup2026-site-design.md`
