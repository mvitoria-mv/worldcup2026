import { fetchJSON, formatDate, formatTime, getFlagImg, getCountryFlagImg, sortByDate, groupByDate } from '../js/utils.js'

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

  const state = { fase: 'Todos', grupo: 'Todos', selecao: 'Todos', sede: 'Todos' }

  const fases = ['Todos', ...jogosData.fases]
  const grupos = ['Todos', 'A','B','C','D','E','F','G','H','I','J','K','L']
  const selecoes = ['Todos', ...selecoesData.selecoes.filter(s => s.grupo).map(s => s.codigo).sort()]
  const sedes = ['Todos', ...new Set(jogosData.jogos.map(j => j.cidade).filter(Boolean))]

  function applyFilters() {
    return sortByDate(jogosData.jogos.filter(j => {
      if (state.fase !== 'Todos' && j.fase !== state.fase) return false
      if (state.grupo !== 'Todos' && j.grupo !== state.grupo) return false
      if (state.selecao !== 'Todos' && j.time_a !== state.selecao && j.time_b !== state.selecao) return false
      if (state.sede !== 'Todos' && j.cidade !== state.sede) return false
      return true
    }))
  }

  function buildFilters() {
    return `
      <div class="section-header"><div class="accent-bar"></div><h2>Calendário de Jogos</h2></div>
      <div class="filter-bar" id="filter-fase">
        ${fases.map(f => `<button class="chip${state.fase===f?' active':''}" data-val="${f}">${f}</button>`).join('')}
      </div>
      <div class="filter-bar" id="filter-grupo">
        ${grupos.map(g => `<button class="chip${state.grupo===g?' active':''}" data-val="${g}">${g==='Todos'?'Todos os grupos':'Grupo '+g}</button>`).join('')}
      </div>
    `
  }

  function buildList(jogos) {
    if (jogos.length === 0) return '<div class="spinner">Nenhum jogo encontrado com esses filtros.</div>'
    const byDate = groupByDate(jogos)
    return [...byDate.entries()].map(([date, gs]) => `
      <div class="day-group">
        <div class="day-label">${formatDate(date)}</div>
        <div class="day-matches">
          ${gs.map(j => buildCard(j, selMap)).join('')}
        </div>
      </div>
    `).join('')
  }

  function fullRender() {
    container.innerHTML = buildFilters() + `<div id="games-list">${buildList(applyFilters())}</div>`
    attachListeners()
  }

  function attachListeners() {
    container.querySelector('#filter-fase')?.addEventListener('click', e => {
      const btn = e.target.closest('.chip'); if (!btn) return
      state.fase = btn.dataset.val
      container.querySelectorAll('#filter-fase .chip').forEach(c => c.classList.toggle('active', c.dataset.val === state.fase))
      container.querySelector('#games-list').innerHTML = buildList(applyFilters())
    })
    container.querySelector('#filter-grupo')?.addEventListener('click', e => {
      const btn = e.target.closest('.chip'); if (!btn) return
      state.grupo = btn.dataset.val
      container.querySelectorAll('#filter-grupo .chip').forEach(c => c.classList.toggle('active', c.dataset.val === state.grupo))
      container.querySelector('#games-list').innerHTML = buildList(applyFilters())
    })
  }

  fullRender()
}

function buildCard(jogo, selMap) {
  const tA = selMap[jogo.time_a] || { nome: jogo.time_a, bandeira: '🏳️' }
  const tB = selMap[jogo.time_b] || { nome: jogo.time_b, bandeira: '🏳️' }
  const isFinished = jogo.status === 'encerrado'
  const isTBD = jogo.time_a === 'TBD'

  return `
    <div class="match-card">
      <div class="match-team">
        ${isTBD ? '<span style="font-size:20px">❓</span>' : getFlagImg(jogo.time_a)}
        <span class="team-name">${isTBD ? 'A definir' : tA.nome}</span>
      </div>
      <div class="match-center">
        ${isFinished
          ? `<span class="match-score">${jogo.placar_a} – ${jogo.placar_b}</span>`
          : `<span class="match-time">${formatTime(jogo.hora)}</span><span class="match-vs">VS</span>`
        }
        <div class="match-meta">${getCountryFlagImg(jogo.pais_sede)} ${jogo.cidade}</div>
        <span class="match-status-badge${isFinished?' encerrado':''}">${jogo.grupo ? 'Gr. '+jogo.grupo : jogo.fase}</span>
      </div>
      <div class="match-team right">
        ${isTBD ? '<span style="font-size:20px">❓</span>' : getFlagImg(jogo.time_b)}
        <span class="team-name">${isTBD ? 'A definir' : tB.nome}</span>
      </div>
    </div>
  `
}
