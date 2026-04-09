# Design Spec: Site Copa do Mundo 2026

**Data:** 2026-04-08  
**Projeto:** WorldCups_02  
**Status:** Aprovado

---

## 1. Visão Geral

Site informativo e estatístico sobre a Copa do Mundo 2026, com acompanhamento de próximos jogos. Público-alvo duplo: fã casual (interface simples, foco em jogos) e entusiasta (estatísticas detalhadas, histórico, comparativos). Tecnologia: HTML/CSS/JS puro, mobile-first, dados estáticos em JSON coletados da FIFA e fontes confiáveis.

---

## 2. Arquitetura

### Abordagem
Shell único (`index.html`) com conteúdo dinâmico via módulos JS nativos (ES Modules). Roteamento por `#hash`. Sem bundler, sem framework, sem dependências externas.

### Fluxo de navegação
1. `index.html` carrega `js/router.js` como módulo
2. `router.js` escuta `hashchange` e `DOMContentLoaded`
3. Ao detectar o hash (ex: `#grupos`), importa `sections/grupos.js` com `import()` dinâmico
4. O módulo busca o JSON correspondente com `fetch()` e renderiza no `<main>`
5. Hash vazio ou `#home` → carrega `sections/home.js` por padrão

### Desenvolvimento local
Requer servidor HTTP simples (ex: `npx live-server` ou `python -m http.server`) por causa do CORS com `fetch()` em módulos ES.

---

## 3. Estrutura de Arquivos

```
WorldCups_02/
├── index.html
├── styles/
│   ├── main.css          ← reset, variáveis CSS, layout base
│   ├── nav.css           ← top tabs mobile-first
│   └── components.css    ← cards, tabelas, badges reutilizáveis
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

---

## 4. Tema Visual

**Estilo:** Vibrant / Copa 2026 — gradiente vermelho e azul (cores dos EUA, sede principal), acentos dourados.

```css
:root {
  --color-primary:      #BF0A30;
  --color-secondary:    #002868;
  --color-accent:       #FFD700;
  --color-bg:           #0d0a1e;
  --color-surface:      #1a0a20;
  --color-text:         #ffffff;
  --color-text-muted:   rgba(255, 255, 255, 0.6);
}
```

Gradiente padrão: `linear-gradient(135deg, #BF0A30 0%, #002868 100%)`

---

## 5. Navegação

**Padrão:** Top Tabs com scroll horizontal (inspirado em Google/YouTube Mobile).

- Abas fixas no topo, abaixo do header com logo
- Todas as 7 seções acessíveis via scroll horizontal nas abas
- Aba ativa com fundo `rgba(255,255,255,0.25)` e texto branco bold
- Abas inativas com texto `--color-text-muted`
- Em desktop: todas as abas visíveis sem scroll

**Seções e ordem das abas:**
`Home · Jogos · Grupos · Seleções · Estatísticas · Histórico · Sedes`

---

## 6. Seções

### 6.1 Home (`#home`)
- Banner compacto com o próximo jogo agendado (time A vs time B, data, hora, estádio)
- Feed cronológico de jogos agrupados por dia ("Hoje", "Amanhã", datas futuras)
- Jogos passados exibem placar; agendados exibem horário
- Filtro rápido por fase: Grupos / Oitavas / Quartas / Semifinal / Final

### 6.2 Jogos (`#jogos`)
- Calendário completo dos 104 jogos
- Filtros: por fase, por grupo, por seleção, por sede
- Card por jogo: bandeiras, placar ou horário, estádio, cidade

### 6.3 Grupos (`#grupos`)
- Grid com os 12 grupos (A–L)
- Tabela por grupo: Seleção, J, V, E, D, GP, GC, SG, Pts
- Destaque visual (borda/badge) para os 2 classificados de cada grupo

### 6.4 Seleções (`#selecoes`)
- Lista de todas as 48 seleções com bandeira e grupo
- Clique abre detalhe da seleção:
  - Elenco (nome, posição, clube, número)
  - Stats do torneio (J, V, E, D, GP, GC, Pts)
  - Histórico em Copas (títulos, anos, campanhas)
  - Head-to-head: confrontos diretos históricos com outras seleções (somente histórico, não comparativo de stats)

### 6.5 Estatísticas (`#estatisticas`)
- Artilharia: ranking de goleadores (nome, seleção, clube, gols)
- Stats por seleção: gols marcados/sofridos, finalizações, posse
- Stats individuais: assistências, passes, defesas (filtrado por posição)
- Comparativo head-to-head: ferramenta livre onde o usuário seleciona 2 seleções quaisquer e vê comparativo de stats do torneio atual lado a lado (distinto do histórico de confrontos diretos na seção Seleções)

### 6.6 Histórico (`#historico`)
- Timeline de todas as Copas (1930–2022)
- Card por edição: sede, campeão, vice, 3º lugar, artilheiro, total de gols
- Ranking histórico de títulos por seleção
- Recordes: maior goleada, mais gols numa edição, artilheiro histórico, etc.

### 6.7 Sedes (`#sedes`)
- Cards dos 16 estádios com: nome, cidade, país, capacidade, nº de jogos
- Agrupados por país: EUA / México / Canadá

---

## 7. Estrutura dos Dados JSON

### `data/jogos.json`
```json
{
  "fases": ["Grupos", "Oitavas", "Quartas", "Semifinal", "Final"],
  "jogos": [{
    "id": "G01",
    "fase": "Grupos",
    "grupo": "A",
    "data": "2026-06-11",
    "hora": "15:00",
    "sede": "SoFi Stadium",
    "cidade": "Los Angeles",
    "pais_sede": "EUA",
    "time_a": "MEX",
    "time_b": "CAN",
    "placar_a": null,
    "placar_b": null,
    "status": "agendado"
    // status: "agendado" | "encerrado" (dados estáticos não suportam ao_vivo)
  }]
}
```

### `data/selecoes.json`
```json
{
  "selecoes": [{
    "codigo": "BRA",
    "nome": "Brasil",
    "grupo": "E",
    "bandeira": "🇧🇷",
    "titulos_copa": 5,
    "anos_titulo": [1958, 1962, 1970, 1994, 2002],
    "elenco": [
      { "nome": "Vinicius Jr", "posicao": "ATA", "clube": "Real Madrid", "numero": 7 }
    ],
    "stats_torneio": {
      "jogos": 0, "vitorias": 0, "empates": 0, "derrotas": 0,
      "gols_pro": 0, "gols_contra": 0, "pontos": 0
    }
  }]
}
```

### `data/historico.json`
```json
{
  "copas": [{
    "ano": 2022,
    "sede": "Qatar",
    "campeao": "ARG",
    "vice": "FRA",
    "terceiro": "HRV",
    "artilheiro": { "nome": "Mbappé", "selecao": "FRA", "gols": 8 },
    "total_gols": 172,
    "total_jogos": 64
  }]
}
```

### `data/sedes.json`
```json
{
  "sedes": [{
    "id": "sofi",
    "estadio": "SoFi Stadium",
    "cidade": "Los Angeles",
    "pais": "EUA",
    "capacidade": 70240,
    "jogos": 8
  }]
}
```

### `data/grupos.json`
```json
{
  "grupos": [{
    "id": "A",
    "selecoes": ["MEX", "CAN", "ECU", "BEL"],
    "classificacao": [
      { "codigo": "MEX", "j": 0, "v": 0, "e": 0, "d": 0, "gp": 0, "gc": 0, "sg": 0, "pts": 0 }
    ]
  }]
}
```

### `data/artilharia.json`
```json
{
  "artilheiros": [{
    "nome": "Vinicius Jr",
    "selecao": "BRA",
    "clube": "Real Madrid",
    "gols": 0,
    "assistencias": 0
  }]
}
```

---

## 8. Módulos JS

### `js/router.js`
- Escuta `DOMContentLoaded` e `hashchange`
- Lê `window.location.hash` (ex: `#grupos`)
- Importa dinamicamente o módulo da seção: `import('./sections/grupos.js')`
- Chama `render(mainEl)` exportado pelo módulo
- Atualiza a aba ativa no nav

### `js/utils.js`
Helpers compartilhados:
- `fetchJSON(path)` — wrapper de `fetch()` com tratamento de erro
- `formatDate(dateStr)` — formata `2026-06-11` → `11 Jun`
- `formatTime(timeStr)` — formata `15:00` → `15h00`
- `getFlag(codigo)` — retorna emoji de bandeira pelo código da seleção
- `renderTemplate(templateId, data)` — clona `<template>` e faz bind de dados

### Cada módulo em `sections/`
Exporta uma função `render(container)` que:
1. Chama `fetchJSON()` para carregar os dados necessários
2. Monta o HTML da seção
3. Injeta em `container.innerHTML`
4. Registra event listeners para interatividade (filtros, cliques em seleção, etc.)

---

## 9. Critérios de Sucesso

- Abre e navega corretamente em Chrome/Firefox/Safari mobile e desktop
- Todas as 7 seções carregam sem erros no console
- Filtros de jogos funcionam corretamente
- Head-to-head exibe comparativo correto entre 2 seleções selecionadas
- Layout mobile-first legível em telas de 375px de largura
- Dados coletados e validados da FIFA e fontes confiáveis
