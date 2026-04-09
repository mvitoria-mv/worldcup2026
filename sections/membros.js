// ============================================================
// sections/membros.js — Área de Membros
// Dados históricos 1930-2014 via CSV (data_csv/)
// ============================================================
import { isLoggedIn, login, logout, getUser } from '../js/auth.js'
import { parseCSV } from '../js/csv-parser.js'

// ── Module-level cache ─────────────────────────────────────
let _cups    = null
let _matches = null
let _players = null
const _charts = {}

// ── CSS injection (lazy) ───────────────────────────────────
function injectCSS() {
  if (document.getElementById('membros-css')) return
  const l = document.createElement('link')
  l.id = 'membros-css'; l.rel = 'stylesheet'; l.href = 'styles/membros.css'
  document.head.appendChild(l)
}

// ── Entry point ────────────────────────────────────────────
export async function render(container) {
  injectCSS()
  destroyAllCharts()
  if (!isLoggedIn()) renderLogin(container)
  else               renderShell(container)
}

// ── Helpers ────────────────────────────────────────────────
function destroyAllCharts() {
  Object.values(_charts).forEach(c => { try { c.destroy() } catch (_) {} })
  Object.keys(_charts).forEach(k => delete _charts[k])
}

// ── Login ──────────────────────────────────────────────────
function renderLogin(container) {
  container.innerHTML = `
    <div class="m-login-wrap">
      <div class="m-login-card">
        <span class="m-login-icon">⚽</span>
        <h2 class="m-login-title">Área de Membros</h2>
        <p class="m-login-sub">Acesse dados históricos exclusivos das Copas do Mundo</p>
        <form class="m-login-form" id="login-form" novalidate>
          <div class="m-login-field">
            <label for="inp-user">Usuário</label>
            <input id="inp-user" type="text" name="user" class="m-login-input"
              placeholder="demo" autocomplete="username" />
          </div>
          <div class="m-login-field">
            <label for="inp-pass">Senha</label>
            <input id="inp-pass" type="password" name="pass" class="m-login-input"
              placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div class="m-login-error" id="login-error" style="display:none">
            Usuário ou senha incorretos. Tente novamente.
          </div>
          <button type="submit" class="m-login-btn">Entrar</button>
        </form>
        <div class="m-login-hint">
          Acesso demo: <code>demo</code> / <code>copa2026</code>
        </div>
      </div>
    </div>
  `

  container.querySelector('#login-form').addEventListener('submit', e => {
    e.preventDefault()
    const user   = e.target.user.value.trim()
    const pass   = e.target.pass.value.trim()
    const errEl  = container.querySelector('#login-error')
    if (login(user, pass)) {
      errEl.style.display = 'none'
      renderShell(container)
    } else {
      errEl.style.display = 'block'
      e.target.pass.value = ''
      e.target.pass.focus()
    }
  })
}

// ── Shell ──────────────────────────────────────────────────
function renderShell(container) {
  container.innerHTML = `
    <div class="m-header">
      <div class="m-header-left">
        <span class="m-header-badge">Área de Membros</span>
        <span class="m-header-user">👤 ${getUser()}</span>
      </div>
      <button class="m-logout-btn" id="btn-logout">Sair</button>
    </div>
    <div class="inner-tabs" id="members-tabs">
      <div class="inner-tab active" data-tab="dashboard">Dashboard</div>
      <div class="inner-tab" data-tab="partidas">Partidas</div>
      <div class="inner-tab" data-tab="artilheiros">Artilheiros</div>
    </div>
    <div id="members-content"><div class="spinner"></div></div>
  `

  container.querySelector('#btn-logout').addEventListener('click', () => {
    logout()
    destroyAllCharts()
    renderLogin(container)
  })

  container.querySelector('#members-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]')
    if (!tab) return
    container.querySelectorAll('#members-tabs .inner-tab')
      .forEach(t => t.classList.toggle('active', t === tab))
    switchTab(container, tab.dataset.tab)
  })

  switchTab(container, 'dashboard')
}

async function switchTab(container, tab) {
  destroyAllCharts()
  const content = container.querySelector('#members-content')
  content.innerHTML = '<div class="spinner"></div>'
  try {
    switch (tab) {
      case 'dashboard':   await showDashboard(content);   break
      case 'partidas':    await showPartidas(content);    break
      case 'artilheiros': await showArtilheiros(content); break
    }
  } catch (err) {
    content.innerHTML = `<div class="error-state">Erro ao carregar: ${err.message}</div>`
    console.error(err)
  }
}

// ── Data loading ───────────────────────────────────────────
async function loadCupsMatches() {
  if (_cups && _matches) return { cups: _cups, matches: _matches }
  const [ct, mt] = await Promise.all([
    fetch('data_csv/WorldCups.csv').then(r => { if (!r.ok) throw new Error('WorldCups.csv não encontrado'); return r.text() }),
    fetch('data_csv/WorldCupMatches.csv').then(r => { if (!r.ok) throw new Error('WorldCupMatches.csv não encontrado'); return r.text() }),
  ])
  _cups    = parseCSV(ct)
  _matches = parseCSV(mt)
  return { cups: _cups, matches: _matches }
}

async function loadPlayers() {
  if (_players) return _players
  const text = await fetch('data_csv/WorldCupPlayers.csv')
    .then(r => { if (!r.ok) throw new Error('WorldCupPlayers.csv não encontrado'); return r.text() })
  _players = parseCSV(text)
  return _players
}

// ── Attendance parser (European dots format) ───────────────
function parseAtt(s) { return parseInt((s || '0').replace(/\./g, '')) || 0 }

// ── Goal counter from Event string ────────────────────────
function countGoals(event) {
  if (!event) return 0
  const all = (event.match(/G\d+'/g) || []).length
  const own = (event.match(/G\d+'\(o\)/g) || []).length
  return all - own
}

// ── DASHBOARD ──────────────────────────────────────────────
async function showDashboard(el) {
  const { cups } = await loadCupsMatches()

  const totalGoals   = cups.reduce((s, c) => s + (parseInt(c.GoalsScored) || 0), 0)
  const totalMatches = cups.reduce((s, c) => s + (parseInt(c.MatchesPlayed) || 0), 0)
  const maxAttCup    = cups.reduce((a, b) => parseAtt(a.Attendance) > parseAtt(b.Attendance) ? a : b)

  const champCount = {}
  cups.forEach(c => {
    const w = (c.Winner === 'Germany FR') ? 'Germany' : c.Winner
    champCount[w] = (champCount[w] || 0) + 1
  })

  el.innerHTML = `
    <div class="m-stat-grid">
      <div class="m-stat-card">
        <div class="m-stat-num">${cups.length}</div>
        <div class="m-stat-label">Edições 1930–2014</div>
      </div>
      <div class="m-stat-card">
        <div class="m-stat-num">${totalGoals.toLocaleString('pt-BR')}</div>
        <div class="m-stat-label">Gols Históricos</div>
      </div>
      <div class="m-stat-card">
        <div class="m-stat-num">${totalMatches.toLocaleString('pt-BR')}</div>
        <div class="m-stat-label">Partidas Disputadas</div>
      </div>
      <div class="m-stat-card">
        <div class="m-stat-num">${Math.round(parseAtt(maxAttCup.Attendance)/1000)}k</div>
        <div class="m-stat-label">Recorde Público</div>
        <div class="m-stat-sub">${maxAttCup.Year} · ${maxAttCup.Country}</div>
      </div>
    </div>

    <div class="m-charts-grid">
      <div class="m-chart-card">
        <div class="m-chart-title">⚽ Gols por Edição</div>
        <div class="m-chart-wrap"><canvas id="ch-goals"></canvas></div>
      </div>
      <div class="m-chart-card">
        <div class="m-chart-title">🏆 Campeões Históricos</div>
        <div class="m-chart-wrap m-chart-wrap--sm"><canvas id="ch-champs"></canvas></div>
      </div>
      <div class="m-chart-card m-chart-card--wide">
        <div class="m-chart-title">👥 Público Total por Edição (em milhares)</div>
        <div class="m-chart-wrap"><canvas id="ch-att"></canvas></div>
      </div>
      <div class="m-chart-card">
        <div class="m-chart-title">📊 Média de Gols por Jogo</div>
        <div class="m-chart-wrap"><canvas id="ch-avg"></canvas></div>
      </div>
    </div>
  `

  if (!window.Chart) {
    el.querySelectorAll('.m-chart-wrap').forEach(w => {
      w.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:32px;font-size:12px">Chart.js não disponível.<br>Verifique sua conexão com a internet.</p>'
    })
    return
  }

  Chart.defaults.color      = 'rgba(245,245,247,0.45)'
  Chart.defaults.font.family = "'Space Grotesk', sans-serif"
  Chart.defaults.font.size   = 10

  const years  = cups.map(c => c.Year)
  const goals  = cups.map(c => parseInt(c.GoalsScored) || 0)
  const att    = cups.map(c => Math.round(parseAtt(c.Attendance) / 1000))
  const avg    = cups.map(c => {
    const g = parseInt(c.GoalsScored)  || 0
    const m = parseInt(c.MatchesPlayed) || 1
    return parseFloat((g / m).toFixed(2))
  })

  const grid    = 'rgba(255,255,255,0.04)'
  const tick    = 'rgba(245,245,247,0.40)'
  const tooltip = {
    backgroundColor: 'rgba(8,9,16,0.95)',
    titleColor:  '#F5F5F7',
    bodyColor:   'rgba(245,245,247,0.65)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, padding: 10, cornerRadius: 6,
  }
  const scalesXY = {
    x: { grid: { color: grid }, ticks: { color: tick }, border: { color: 'rgba(255,255,255,0.06)' } },
    y: { grid: { color: grid }, ticks: { color: tick }, border: { color: 'rgba(255,255,255,0.06)' } },
  }

  // ─ Bar: goals per edition ─
  _charts.goals = new Chart(document.getElementById('ch-goals'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Gols',
        data:  goals,
        backgroundColor: goals.map((_, i) => i % 2 === 0 ? 'rgba(232,0,45,0.60)' : 'rgba(0,51,160,0.60)'),
        borderColor:     goals.map((_, i) => i % 2 === 0 ? '#E8002D' : '#0033A0'),
        borderWidth: 1, borderRadius: 4, borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: scalesXY,
    },
  })

  // ─ Doughnut: champions ─
  const champEntries = Object.entries(champCount).sort((a, b) => b[1] - a[1])
  const doughColors  = ['#E8002D','#0033A0','#FFD700','#30D158','#BF5AF2','#FF9500','rgba(232,235,245,0.25)']
  _charts.champs = new Chart(document.getElementById('ch-champs'), {
    type: 'doughnut',
    data: {
      labels:   champEntries.map(([k]) => k),
      datasets: [{
        data:            champEntries.map(([, v]) => v),
        backgroundColor: doughColors,
        borderColor:     'rgba(8,9,16,0.6)',
        borderWidth: 2, hoverBorderWidth: 3,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { display: true, position: 'right',
          labels: { color: 'rgba(245,245,247,0.55)', boxWidth: 10, padding: 8, font: { size: 10 } },
        },
        tooltip,
      },
    },
  })

  // ─ Line: attendance ─
  _charts.att = new Chart(document.getElementById('ch-att'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Público (mil)',
        data:  att,
        borderColor:     '#0033A0',
        backgroundColor: 'rgba(0,51,160,0.07)',
        fill: true, tension: 0.38,
        pointRadius: 4, pointBackgroundColor: '#0033A0',
        pointBorderColor: '#F5F5F7', pointBorderWidth: 1.5,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: scalesXY,
    },
  })

  // ─ Line: avg goals per match ─
  _charts.avg = new Chart(document.getElementById('ch-avg'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Média gols/jogo',
        data:  avg,
        borderColor:     '#E8002D',
        backgroundColor: 'rgba(232,0,45,0.06)',
        fill: true, tension: 0.38,
        pointRadius: 4, pointBackgroundColor: '#E8002D',
        pointBorderColor: '#F5F5F7', pointBorderWidth: 1.5,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: {
        x: scalesXY.x,
        y: { ...scalesXY.y, beginAtZero: false },
      },
    },
  })
}

// ── PARTIDAS ───────────────────────────────────────────────
async function showPartidas(el) {
  const { matches } = await loadCupsMatches()

  let filterYear  = ''
  let filterStage = ''
  let page        = 1
  const PAGE_SIZE = 25

  const years  = ['', ...[...new Set(matches.map(m => m.Year))].sort()]
  const stages = ['', ...[...new Set(matches.map(m => m.Stage.trim()))].sort()]

  function getFiltered() {
    return matches.filter(m =>
      (!filterYear  || m.Year === filterYear) &&
      (!filterStage || m.Stage.trim() === filterStage)
    )
  }

  function renderBody() {
    const data  = getFiltered()
    const total = data.length
    const pages = Math.ceil(total / PAGE_SIZE)
    const slice = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    el.querySelector('#p-count').textContent = `${total.toLocaleString('pt-BR')} partidas`
    el.querySelector('#p-tbody').innerHTML = slice.map(m => {
      const hg = m['Home Team Goals']
      const ag = m['Away Team Goals']
      const att = parseInt(m.Attendance || 0)
      return `
        <tr>
          <td class="p-year">${m.Year}</td>
          <td class="p-stage">${m.Stage.trim()}</td>
          <td class="p-home">${m['Home Team Name']}</td>
          <td class="p-score">${hg} – ${ag}</td>
          <td class="p-away">${m['Away Team Name']}</td>
          <td class="p-city">${(m.City || '').trim()}</td>
          <td style="text-align:right;color:var(--color-text-dim);font-variant-numeric:tabular-nums">
            ${att ? att.toLocaleString('pt-BR') : '—'}
          </td>
        </tr>`
    }).join('')

    el.querySelector('#p-pag').innerHTML = buildPagination(page, pages)
  }

  el.innerHTML = `
    <div class="m-data-header">
      <div class="m-filters">
        <select id="f-year" class="m-select">
          ${years.map(y => `<option value="${y}">${y || 'Todas as Edições'}</option>`).join('')}
        </select>
        <select id="f-stage" class="m-select">
          ${stages.map(s => `<option value="${s}">${s || 'Todas as Fases'}</option>`).join('')}
        </select>
        <span id="p-count" class="m-count"></span>
      </div>
    </div>
    <div class="m-table-wrap">
      <table class="stats-table m-table">
        <thead>
          <tr>
            <th>Ano</th><th>Fase</th>
            <th style="text-align:right">Casa</th>
            <th style="text-align:center">Placar</th>
            <th>Visitante</th><th>Cidade</th>
            <th style="text-align:right">Público</th>
          </tr>
        </thead>
        <tbody id="p-tbody"></tbody>
      </table>
    </div>
    <div id="p-pag"></div>
  `

  renderBody()

  el.querySelector('#f-year').addEventListener('change',  e => { filterYear  = e.target.value; page = 1; renderBody() })
  el.querySelector('#f-stage').addEventListener('change', e => { filterStage = e.target.value; page = 1; renderBody() })
  el.addEventListener('click', e => {
    const btn = e.target.closest('.m-page-btn')
    if (!btn || btn.disabled) return
    page = parseInt(btn.dataset.page)
    renderBody()
    el.querySelector('.m-table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function buildPagination(current, total) {
  if (total <= 1) return ''
  const items = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push({ v: i })
  } else {
    items.push({ v: 1 })
    if (current > 3) items.push({ sep: true })
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) items.push({ v: i })
    if (current < total - 2) items.push({ sep: true })
    items.push({ v: total })
  }
  return `
    <div class="m-pagination">
      <button class="m-page-btn" data-page="${current - 1}" ${current === 1 ? 'disabled' : ''}>‹</button>
      ${items.map(p => p.sep
        ? '<span class="m-page-sep">…</span>'
        : `<button class="m-page-btn${p.v === current ? ' active' : ''}" data-page="${p.v}">${p.v}</button>`
      ).join('')}
      <button class="m-page-btn" data-page="${current + 1}" ${current === total ? 'disabled' : ''}>›</button>
    </div>`
}

// ── ARTILHEIROS ────────────────────────────────────────────
async function showArtilheiros(el) {
  el.innerHTML = '<div class="spinner"></div>'
  await new Promise(r => setTimeout(r, 20)) // yield so spinner renders

  const players = await loadPlayers()

  const goalMap  = {}
  const nameMap  = {}
  const teamsMap = {}

  for (const row of players) {
    const g = countGoals(row.Event)
    if (!g) continue
    const norm = (row['Player Name'] || '').trim().toUpperCase() + '|' + (row['Team Initials'] || '').trim()
    if (!nameMap[norm]) {
      nameMap[norm]  = (row['Player Name']   || '').trim()
      teamsMap[norm] = (row['Team Initials'] || '').trim()
    }
    goalMap[norm] = (goalMap[norm] || 0) + g
  }

  const top = Object.entries(goalMap)
    .map(([key, goals]) => ({ name: nameMap[key], team: teamsMap[key], goals }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 50)

  el.innerHTML = `
    <div class="m-section-note">
      Top artilheiros de todas as Copas do Mundo de 1930 a 2014
      — base de ${players.length.toLocaleString('pt-BR')} registros de jogadores
    </div>
    <div class="m-table-wrap">
      <table class="stats-table m-table">
        <thead>
          <tr>
            <th style="width:36px">#</th>
            <th>Jogador</th>
            <th>País</th>
            <th style="text-align:right">Gols</th>
          </tr>
        </thead>
        <tbody>
          ${top.map((s, i) => `
            <tr>
              <td class="rank-cell${i < 3 ? ' top3' : ''}">${i + 1}</td>
              <td><strong>${s.name}</strong></td>
              <td style="color:var(--color-text-muted)">${s.team}</td>
              <td style="text-align:right;font-family:var(--font-display);font-size:16px;font-weight:800;
                color:${i < 3 ? 'var(--copa-gold)' : i < 10 ? 'var(--copa-red)' : 'var(--color-text)'}">${s.goals}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}
