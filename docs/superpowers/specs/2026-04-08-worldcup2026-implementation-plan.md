# Plano de Implementação: Site Copa do Mundo 2026

**Data:** 2026-04-08  
**Spec de referência:** `2026-04-08-worldcup2026-site-design.md`

---

## Visão geral das fases

| Fase | Entrega | Dependências |
|------|---------|--------------|
| 1 | Shell, CSS, Router, Utils | — |
| 2 | Dados JSON completos | — |
| 3 | Seções (Home → Sedes) | Fases 1 e 2 |
| 4 | Testes e validação | Fase 3 |

As fases 1 e 2 podem ser feitas em paralelo. As seções da fase 3 podem ser implementadas em qualquer ordem, mas Home e Jogos devem vir antes das demais por serem a porta de entrada.

---

## Fase 1 — Fundação (Shell + CSS + Router + Utils)

### Passo 1.1 — `index.html`

Criar o shell estático. Não contém conteúdo de seção — apenas estrutura fixa.

```
<header>
  logo + título "WORLD CUP 2026"

<nav id="tab-nav">
  <a href="#home">Home</a>
  <a href="#jogos">Jogos</a>
  <a href="#grupos">Grupos</a>
  <a href="#selecoes">Seleções</a>
  <a href="#estatisticas">Estatísticas</a>
  <a href="#historico">Histórico</a>
  <a href="#sedes">Sedes</a>

<main id="app">
  <!-- conteúdo injetado pelo router -->

<script type="module" src="js/router.js">
```

### Passo 1.2 — `styles/main.css`

- Reset básico (`*, box-sizing: border-box`, `margin: 0`, `padding: 0`)
- Variáveis CSS do tema Vibrant (conforme spec)
- Layout base: `body` com `background: var(--color-bg)`, `color: var(--color-text)`
- Header: gradiente `linear-gradient(135deg, #BF0A30, #002868)`, padding, logo

### Passo 1.3 — `styles/nav.css`

- Nav como flex row com `overflow-x: auto`, `scroll-snap-type: x mandatory`
- Cada `<a>`: `white-space: nowrap`, padding, `scroll-snap-align: start`
- Aba ativa (classe `.active`): `background: rgba(255,255,255,0.25)`, `font-weight: 700`
- Inativa: `color: var(--color-text-muted)`
- Ocultar scrollbar nativa (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`)
- Desktop (min-width: 768px): sem overflow, todas as abas visíveis

### Passo 1.4 — `styles/components.css`

Componentes reutilizáveis entre seções:

- `.card` — card de jogo: bordas arredondadas, fundo `var(--color-surface)`, padding
- `.match-card` — variante de card com layout flex para time A | placar/hora | time B
- `.table` — tabela de grupos: largura 100%, striping alternado, header destacado
- `.badge` — badge de classificado (verde) / eliminado (vermelho)
- `.filter-bar` — barra de filtros: scroll horizontal de chips clicáveis
- `.chip` — item de filtro: pill arredondado, ativo/inativo
- `.section-title` — título de seção com linha decorativa accent
- `.player-card` — card de jogador: nome, posição, clube
- `.stat-bar` — barra de progresso para comparativos
- `.spinner` — loading state para fetch async

### Passo 1.5 — `js/utils.js`

Implementar e exportar:

```js
export async function fetchJSON(path) { ... }
// Faz fetch, verifica response.ok, retorna JSON. Lança Error com mensagem legível.

export function formatDate(dateStr) { ... }
// "2026-06-11" → "11 Jun" (pt-BR). Usa Date sem fuso — parsear como local.

export function formatTime(timeStr) { ... }
// "15:00" → "15h00"

export function formatDateLabel(dateStr) { ... }
// Compara com hoje: retorna "Hoje", "Amanhã", ou "11 Jun" (formatDate)

export function getFlag(codigo) { ... }
// Mapa estático: { "BRA": "🇧🇷", "ARG": "🇦🇷", ... } para todas as 48 seleções

export function sortByDate(jogos) { ... }
// Ordena array de jogos por campo `data` + `hora` ASC
```

### Passo 1.6 — `js/router.js`

```js
// Mapa hash → caminho do módulo
const routes = {
  home:         './sections/home.js',
  jogos:        './sections/jogos.js',
  grupos:       './sections/grupos.js',
  selecoes:     './sections/selecoes.js',
  estatisticas: './sections/estatisticas.js',
  historico:    './sections/historico.js',
  sedes:        './sections/sedes.js',
}

async function navigate() {
  const hash = window.location.hash.slice(1) || 'home'
  const route = routes[hash] ?? routes.home
  // Atualiza aba ativa no nav
  // import() dinâmico do módulo
  // Chama module.render(document.getElementById('app'))
}

document.addEventListener('DOMContentLoaded', navigate)
window.addEventListener('hashchange', navigate)
```

**Verificação da fase 1:** abrir `index.html` via live-server, navegar pelas abas — `<main>` deve mostrar "Carregando…" ou erro de módulo não implementado, sem crashes no console.

---

## Fase 2 — Dados JSON

Pesquisar e preencher os arquivos em `data/`. Fontes: FIFA.com, Wikipedia, Transfermarkt, ESPN.

### Passo 2.1 — `data/sedes.json`
16 estádios confirmados pela FIFA para 2026. Campos: `id`, `estadio`, `cidade`, `pais` (EUA/México/Canadá), `capacidade`, `jogos`.

### Passo 2.2 — `data/historico.json`
Copas de 1930 a 2022 (23 edições). Para cada uma: `ano`, `sede`, `campeao`, `vice`, `terceiro`, `artilheiro { nome, selecao, gols }`, `total_gols`, `total_jogos`.

Adicionar também:
```json
"recordes": {
  "maior_goleada": { "jogo": "...", "placar": "...", "ano": 1954 },
  "mais_gols_edicao": { "ano": 1954, "total": 140 },
  "artilheiro_historico": { "nome": "Miroslav Klose", "selecao": "DEU", "gols": 16 }
}
```

### Passo 2.3 — `data/selecoes.json`
48 seleções confirmadas para 2026. Para cada uma: `codigo` (ISO 3166-1 alpha-3), `nome`, `grupo`, `bandeira` (emoji), `titulos_copa`, `anos_titulo[]`, `elenco[]`, `stats_torneio` (zeros — atualizar durante o torneio), `confrontos_diretos[]` para head-to-head histórico.

Schema de `confrontos_diretos`:
```json
"confrontos_diretos": [
  { "adversario": "ARG", "vitorias": 10, "empates": 5, "derrotas": 8 }
]
```

### Passo 2.4 — `data/grupos.json`
12 grupos (A–L) com as 48 seleções distribuídas (4 por grupo). Tabela de classificação inicializada com zeros.

### Passo 2.5 — `data/jogos.json`
104 jogos:
- 48 jogos da fase de grupos (12 grupos × 3 rodadas → mas na Copa 2026 é 12 grupos × 3 jogos = 36 + 12 = 48 jogos de grupos... na verdade são 48 seleções, 12 grupos de 4, cada grupo tem 6 jogos → 72 jogos de grupos + 32 jogos de mata-mata = 104 total)
- Mata-mata: 32 oitavas + ... na verdade: 16 oitavas + 8 quartas + 4 semis + 1 terceiro lugar + 1 final = 30 + os de grupos

Verificar o calendário oficial da FIFA 2026. Cada jogo com: `id`, `fase`, `grupo` (null para mata-mata), `data`, `hora` (horário local da sede), `sede`, `cidade`, `pais_sede`, `time_a`, `time_b`, `placar_a` (null se não disputado), `placar_b` (null), `status`.

### Passo 2.6 — `data/artilharia.json`
Inicializar com zeros para todos os jogadores relevantes. Atualizar durante o torneio.

**Verificação da fase 2:** validar todos os JSONs com `JSON.parse` (pode usar `node -e "JSON.parse(require('fs').readFileSync('data/jogos.json','utf8'))"` ou um validador online). Verificar que todos os `codigo` de seleção nos JSONs são consistentes entre si.

---

## Fase 3 — Seções

Cada módulo de seção segue o mesmo contrato:
```js
export async function render(container) {
  container.innerHTML = '<div class="spinner">Carregando…</div>'
  const data = await fetchJSON('../data/xxx.json')
  container.innerHTML = buildHTML(data)
  attachListeners(container)
}
```

### Passo 3.1 — `sections/home.js`

1. Buscar `jogos.json`
2. Encontrar o próximo jogo agendado (primeiro com `status === 'agendado'` ordenado por data/hora) → renderizar banner
3. Agrupar todos os jogos por data usando `formatDateLabel()`
4. Renderizar feed cronológico: seção por dia, cards `.match-card` dentro
5. Cada `.match-card` mostra: bandeiras, times, placar (se `status === 'encerrado'`) ou hora (se `status === 'agendado'`), sede
6. Renderizar barra de filtros por fase (`.filter-bar` com `.chip`)
7. Listener nos chips: filtra os dias exibidos por fase, re-renderiza o feed

### Passo 3.2 — `sections/jogos.js`

1. Buscar `jogos.json`
2. Renderizar barra de filtros com 4 dimensões: fase, grupo, seleção, sede
3. Renderizar lista completa de 104 jogos com `.match-card`
4. Listeners nos filtros: aplicar filtros combinados (AND entre dimensões), re-renderizar lista
5. Estado de filtro mantido em variáveis locais do módulo (não persistir entre navegações)

### Passo 3.3 — `sections/grupos.js`

1. Buscar `grupos.json` + `selecoes.json` (para bandeiras e nomes)
2. Renderizar grid de 12 grupos responsivo (1 coluna mobile, 2 colunas tablet, 3 colunas desktop)
3. Cada grupo: tabela `.table` com colunas Sel, J, V, E, D, GP, GC, SG, Pts
4. Ordenar classificação por Pts DESC, SG DESC, GP DESC
5. Linhas 1 e 2 de cada grupo recebem `.badge` verde "Classificado"

### Passo 3.4 — `sections/selecoes.js`

Estado interno: `selectedSelecao = null` (lista) ou código da seleção (detalhe).

**Vista lista:**
1. Buscar `selecoes.json`
2. Grid de cards de seleção: bandeira, nome, grupo
3. Clique no card → `selectedSelecao = codigo`, re-renderizar em vista detalhe

**Vista detalhe (render de uma seleção):**
1. Botão "← Voltar" → `selectedSelecao = null`, re-renderizar lista
2. Seções colapsáveis ou em abas internas: Elenco / Stats do Torneio / Histórico / Confrontos
3. **Elenco:** tabela por posição (GK / DEF / MEI / ATA)
4. **Stats torneio:** tabela J, V, E, D, GP, GC, Pts
5. **Histórico:** lista de Copas participadas, com destaque nos títulos
6. **Confrontos diretos:** lista de adversários com V/E/D histórico

### Passo 3.5 — `sections/estatisticas.js`

Estado interno: `activeTab = 'artilharia'`, `h2hSelA = null`, `h2hSelB = null`.

**Aba Artilharia:**
1. Buscar `artilharia.json`
2. Tabela ordenada por gols DESC: posição, nome, bandeira, clube, gols, assistências

**Aba Stats por Seleção:**
1. Buscar `selecoes.json`
2. Tabela ordenada por gols_pro DESC: seleção, J, GP, GC, SG

**Aba Stats Individuais:**
1. Buscar `selecoes.json` (campo `elenco` com stats individuais se disponíveis)
2. Filtro por posição: Todos / GK / DEF / MEI / ATA
3. Tabela: nome, seleção, posição, stat principal da posição

**Aba Head-to-Head:**
1. Dois selects com todas as 48 seleções
2. Ao selecionar ambas → buscar stats de `selecoes.json` para as duas
3. Renderizar comparativo lado a lado com `.stat-bar` para cada métrica (gols, vitórias, etc.)

### Passo 3.6 — `sections/historico.js`

1. Buscar `historico.json`
2. Timeline vertical: cards das Copas em ordem cronológica (mais recente primeiro)
3. Cada card: ano, sede, bandeira campeão, vice, artilheiro, total gols
4. Títulos com destaque visual (badge dourado para campeão)
5. Ranking de títulos: tabela seleção → nº de títulos, anos
6. Recordes: seção estática no final com os 3-4 recordes históricos

### Passo 3.7 — `sections/sedes.js`

1. Buscar `sedes.json`
2. Agrupar por país: EUA / México / Canadá
3. Header por país com total de jogos no país
4. Grid de cards por sede: nome do estádio, cidade, capacidade formatada (70.240), nº de jogos

---

## Fase 4 — Testes e Validação

Sem framework de testes (sem bundler). Os testes são manuais + checklist de validação por seção. Recomenda-se usar DevTools do Chrome.

### 4.1 Testes de dados

- [ ] Todos os 6 arquivos JSON fazem parse sem erro
- [ ] Total de seleções em `selecoes.json` = 48
- [ ] Total de jogos em `jogos.json` = 104
- [ ] Total de grupos em `grupos.json` = 12
- [ ] Cada grupo tem exatamente 4 seleções
- [ ] Todos os `time_a` e `time_b` em `jogos.json` existem em `selecoes.json`
- [ ] Todos os `codigo` referenciados em `grupos.json` existem em `selecoes.json`
- [ ] Sedes em `jogos.json` existem em `sedes.json`
- [ ] `historico.json` cobre de 1930 a 2022 (exceto 1942 e 1946 — não realizadas)

### 4.2 Testes de roteamento

- [ ] Abrir `http://localhost:8080` carrega Home por padrão
- [ ] Clicar em cada aba navega para a seção correta (verificar hash na URL)
- [ ] Pressionar voltar/avançar no browser navega corretamente entre seções
- [ ] Acessar `http://localhost:8080/#grupos` diretamente carrega Grupos
- [ ] Hash inválido (ex: `#xpto`) → redireciona para Home

### 4.3 Testes por seção

**Home**
- [ ] Banner exibe o próximo jogo agendado (não um jogo encerrado)
- [ ] Feed agrupa jogos por dia com labels corretas ("Hoje"/"Amanhã"/data)
- [ ] Jogos encerrados exibem placar; agendados exibem horário
- [ ] Filtro por fase oculta dias sem jogos da fase selecionada
- [ ] Filtro "Grupos" + "Todos" alterna corretamente

**Jogos**
- [ ] Todos os 104 jogos aparecem sem filtros ativos
- [ ] Filtro por fase reduz a lista corretamente
- [ ] Filtro por grupo (ex: "Grupo A") exibe apenas os 6 jogos do grupo A
- [ ] Filtro por seleção (ex: "BRA") exibe apenas jogos do Brasil
- [ ] Combinação de dois filtros aplica AND

**Grupos**
- [ ] 12 grupos exibidos
- [ ] Tabela de cada grupo tem 4 linhas
- [ ] Seleções ordenadas por Pts DESC, SG DESC, GP DESC
- [ ] Linhas 1 e 2 têm badge verde

**Seleções**
- [ ] Lista exibe 48 seleções
- [ ] Clicar em seleção abre o detalhe
- [ ] Botão "← Voltar" retorna à lista
- [ ] Detalhe mostra elenco, stats, histórico e confrontos

**Estatísticas**
- [ ] 4 abas navegam corretamente
- [ ] Artilharia ordenada por gols DESC
- [ ] Head-to-head: selecionar 2 seleções exibe comparativo
- [ ] Head-to-head com apenas 1 seleção selecionada não quebra

**Histórico**
- [ ] Todas as Copas listadas (21 edições: 1930–2022, exceto 1942/1946)
- [ ] Ranking de títulos: Brasil = 5 títulos
- [ ] Recordes exibidos corretamente

**Sedes**
- [ ] 16 estádios exibidos
- [ ] Agrupados em EUA / México / Canadá
- [ ] Capacidade formatada com separador de milhar

### 4.4 Testes de responsividade

Usar DevTools (Toggle Device Toolbar) nas seguintes resoluções:

- [ ] 375px (iPhone SE) — layout de 1 coluna, tabs com scroll, sem overflow horizontal
- [ ] 414px (iPhone Pro) — igual
- [ ] 768px (iPad) — grupos em 2 colunas, nav sem scroll
- [ ] 1280px (Desktop) — grupos em 3 colunas, todas as abas visíveis

### 4.5 Testes de compatibilidade de browser

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (iOS 15+) — atenção: ES Modules dinâmicos e `import()` têm suporte desde Safari 11

### 4.6 Testes de robustez

- [ ] Simular falha de fetch (renomear um JSON temporariamente) → spinner não trava, exibe mensagem de erro legível
- [ ] Navegar rapidamente entre abas (hashchange rápido) → sem renders duplicados ou stale
- [ ] Console sem erros ou warnings em nenhuma seção

---

## Checklist de entrega final

- [ ] Todos os testes da fase 4 passando
- [ ] Nenhum `console.error` ou `console.warn` no estado normal de uso
- [ ] Funciona offline (após primeiro carregamento via live-server, sem requests externos)
- [ ] Dados validados contra fontes oficiais (FIFA, Wikipedia)
- [ ] `prd.md` e `CLAUDE.md` atualizados se houve desvios do plano
