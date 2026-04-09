import { fetchJSON, formatDateLabel, formatTime, getFlagImg, getCountryFlagImg, sortByDate, groupByDate } from '../js/utils.js'

export async function render(container) {
  container.innerHTML = '<div class="spinner">Carregando…</div>'

  let jogosData, selecoesData
  try {
    ;[jogosData, selecoesData] = await Promise.all([
      fetchJSON('data/jogos.json'),
      fetchJSON('data/selecoes.json'),
    ])
  } catch (err) {
    container.innerHTML = `<div class="error-state">Erro ao carregar dados: ${err.message}</div>`
    return
  }

  const selMap = Object.fromEntries(selecoesData.selecoes.map(s => [s.codigo, s]))

  let activeFilter = 'Todos'
  const fases = ['Todos', ...jogosData.fases]

  function buildHTML() {
    const filteredAll = activeFilter === 'Todos'
      ? sortByDate(jogosData.jogos.filter(j => j.fase === 'Grupos'))
      : sortByDate(jogosData.jogos.filter(j => j.fase === activeFilter))

    const nextGame = sortByDate(jogosData.jogos).find(j => j.status === 'agendado' && j.time_a !== 'TBD')
    const byDate = groupByDate(filteredAll)

    return `
      ${buildHero()}
      ${nextGame ? buildBanner(nextGame, selMap) : ''}
      ${buildFilterBar(fases, activeFilter)}
      ${buildFeed(byDate, selMap)}
    `
  }

  container.innerHTML = buildHTML()

  const nextGame = sortByDate(jogosData.jogos).find(j => j.status === 'agendado' && j.time_a !== 'TBD')
  if (nextGame) startCountdown(nextGame)

  attachListeners(container, jogosData, selMap)
}

function buildHero() {
  return `
    <div class="hero-section">
      <div class="hero-eyebrow">
        ⚽ A COPA DO MUNDO &nbsp;·&nbsp; 11 JUN → 19 JUL, 2026
      </div>
      <h1 class="hero-headline">
        <span class="hero-copa">Copa do Mundo</span>
        <span class="hero-year-big">2026</span>
      </h1>
      <div class="hero-hosts">
        <span class="host-flag"></span>
        Estados Unidos
        <span class="host-sep">·</span>
        <span class="host-flag"></span>
        México
        <span class="host-sep">·</span>
        <span class="host-flag"></span>
        Canadá
      </div>
    </div>
  `
}

function buildBanner(jogo, selMap) {
  const tA = selMap[jogo.time_a] || { nome: jogo.time_a }
  const tB = selMap[jogo.time_b] || { nome: jogo.time_b }
  return `
    <div class="next-match-banner">
      <div class="banner-label">Próximo Jogo${jogo.grupo ? ` · Grupo ${jogo.grupo}` : ` · ${jogo.fase}`}</div>
      <div class="banner-teams">
        <div class="banner-team">
          ${getFlagImg(jogo.time_a, 64)}
          <span class="name">${tA.nome}</span>
        </div>
        <span class="banner-vs">VS</span>
        <div class="banner-team">
          ${getFlagImg(jogo.time_b, 64)}
          <span class="name">${tB.nome}</span>
        </div>
      </div>
      <div class="banner-info">
        ${formatDateLabel(jogo.data)} · ${formatTime(jogo.hora)}
        · ${jogo.cidade}
      </div>
      <div class="banner-countdown" id="banner-countdown">
        <div class="countdown-unit">
          <span class="countdown-num">--</span>
          <span class="countdown-label">dias</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-unit">
          <span class="countdown-num">--</span>
          <span class="countdown-label">horas</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-unit">
          <span class="countdown-num">--</span>
          <span class="countdown-label">min</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-unit">
          <span class="countdown-num">--</span>
          <span class="countdown-label">seg</span>
        </div>
      </div>
    </div>
  `
}

function startCountdown(jogo) {
  const [year, month, day] = jogo.data.split('-').map(Number)
  const [hours, minutes] = jogo.hora.split(':').map(Number)
  // Use game date/time as-is (simplified — no timezone conversion)
  const gameTime = new Date(year, month - 1, day, hours, minutes, 0)

  function update() {
    const el = document.getElementById('banner-countdown')
    if (!el) { clearInterval(intervalId); return }

    const diff = gameTime - Date.now()

    if (diff <= 0) {
      el.innerHTML = '<div class="countdown-live">AO VIVO</div>'
      clearInterval(intervalId)
      return
    }

    const d = Math.floor(diff / 86_400_000)
    const h = Math.floor((diff % 86_400_000) / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    const s = Math.floor((diff % 60_000) / 1_000)

    el.innerHTML = `
      <div class="countdown-unit">
        <span class="countdown-num">${String(d).padStart(2, '0')}</span>
        <span class="countdown-label">dias</span>
      </div>
      <span class="countdown-sep">:</span>
      <div class="countdown-unit">
        <span class="countdown-num">${String(h).padStart(2, '0')}</span>
        <span class="countdown-label">horas</span>
      </div>
      <span class="countdown-sep">:</span>
      <div class="countdown-unit">
        <span class="countdown-num">${String(m).padStart(2, '0')}</span>
        <span class="countdown-label">min</span>
      </div>
      <span class="countdown-sep">:</span>
      <div class="countdown-unit">
        <span class="countdown-num">${String(s).padStart(2, '0')}</span>
        <span class="countdown-label">seg</span>
      </div>
    `
  }

  update()
  const intervalId = setInterval(update, 1000)
}

function buildFilterBar(fases, active) {
  return `
    <div class="filter-bar" id="phase-filters">
      ${fases.map(f => `
        <button class="chip${f === active ? ' active' : ''}" data-fase="${f}">${f}</button>
      `).join('')}
    </div>
  `
}

function buildFeed(byDate, selMap) {
  if (byDate.size === 0) return '<div class="spinner">Nenhum jogo encontrado.</div>'
  return [...byDate.entries()].map(([date, jogos]) => `
    <div class="day-group">
      <div class="day-label">${formatDateLabel(date)}</div>
      <div class="day-matches">
        ${jogos.map(j => buildMatchCard(j, selMap)).join('')}
      </div>
    </div>
  `).join('')
}

function buildMatchCard(jogo, selMap) {
  const tA = selMap[jogo.time_a] || { nome: jogo.time_a }
  const tB = selMap[jogo.time_b] || { nome: jogo.time_b }
  const isFinished = jogo.status === 'encerrado'

  const centerHTML = isFinished
    ? `<span class="match-score">${jogo.placar_a} – ${jogo.placar_b}</span>`
    : `<span class="match-time">${formatTime(jogo.hora)}</span><span class="match-vs">VS</span>`

  const badgeHTML = `<span class="match-status-badge ${isFinished ? 'encerrado' : ''}">${
    isFinished ? 'Encerrado' : jogo.grupo ? `Gr. ${jogo.grupo}` : jogo.fase
  }</span>`

  return `
    <div class="match-card">
      <div class="match-team">
        ${getFlagImg(jogo.time_a)}
        <span class="team-name">${tA.nome}</span>
      </div>
      <div class="match-center">
        ${centerHTML}
        <div class="match-meta">${jogo.cidade}</div>
        ${badgeHTML}
      </div>
      <div class="match-team right">
        ${getFlagImg(jogo.time_b)}
        <span class="team-name">${tB.nome}</span>
      </div>
    </div>
  `
}

function attachListeners(container, jogosData, selMap) {
  container.querySelector('#phase-filters')?.addEventListener('click', e => {
    const btn = e.target.closest('.chip')
    if (!btn) return
    const fase = btn.dataset.fase

    const jogos = fase === 'Todos'
      ? sortByDate(jogosData.jogos.filter(j => j.fase === 'Grupos'))
      : sortByDate(jogosData.jogos.filter(j => j.fase === fase))

    container.querySelectorAll('#phase-filters .chip')
      .forEach(c => c.classList.toggle('active', c.dataset.fase === fase))

    const feedEl = container.querySelector('.day-group')?.parentElement
    if (feedEl) feedEl.innerHTML = buildFeed(groupByDate(jogos), selMap)
  })
}
