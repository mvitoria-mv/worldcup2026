import { fetchJSON, getFlagImg } from '../js/utils.js'

let _selecoes = null
let _selected = null

export async function render(container) {
  container.innerHTML = '<div class="spinner">Carregando…</div>'

  try {
    const data = await fetchJSON('data/selecoes.json')
    _selecoes = data.selecoes.filter(s => s.grupo !== null)
  } catch (err) {
    container.innerHTML = `<div class="error-state">Erro ao carregar dados: ${err.message}</div>`
    return
  }

  _selected = null
  renderList(container)
}

function renderList(container) {
  const byGroup = {}
  for (const s of _selecoes) {
    if (!byGroup[s.grupo]) byGroup[s.grupo] = []
    byGroup[s.grupo].push(s)
  }

  container.innerHTML = `
    <div class="section-header"><div class="accent-bar"></div><h2>Seleções</h2></div>
    <div class="teams-grid" id="teams-grid">
      ${_selecoes.map(s => `
        <div class="team-card" data-codigo="${s.codigo}">
          ${getFlagImg(s.codigo, 64)}
          <span class="name">${s.nome}</span>
          <span class="group-badge">Grupo ${s.grupo}</span>
        </div>
      `).join('')}
    </div>
  `

  container.querySelector('#teams-grid').addEventListener('click', e => {
    const card = e.target.closest('.team-card')
    if (!card) return
    _selected = card.dataset.codigo
    renderDetail(container, _selecoes.find(s => s.codigo === _selected))
  })
}

function renderDetail(container, sel) {
  container.innerHTML = `
    <button class="back-btn" id="btn-back">← Voltar</button>
    <div class="team-detail-header">
      ${getFlagImg(sel.codigo, 64)}
      <div>
        <h2>${sel.nome}</h2>
        <div class="meta">
          Grupo ${sel.grupo}
          ${sel.titulos_copa > 0 ? ` · 🏆 ${sel.titulos_copa}× Campeão (${sel.anos_titulo.join(', ')})` : ' · Sem títulos'}
        </div>
      </div>
    </div>
    <div class="inner-tabs" id="inner-tabs">
      <div class="inner-tab active" data-tab="elenco">Elenco</div>
      <div class="inner-tab" data-tab="stats">Stats do Torneio</div>
      <div class="inner-tab" data-tab="historico">Histórico</div>
      <div class="inner-tab" data-tab="confrontos">Confrontos</div>
    </div>
    <div id="tab-content">
      ${renderElenco(sel)}
    </div>
  `

  container.querySelector('#btn-back').addEventListener('click', () => renderList(container))

  container.querySelector('#inner-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.inner-tab')
    if (!tab) return
    container.querySelectorAll('.inner-tab').forEach(t => t.classList.toggle('active', t === tab))
    const content = container.querySelector('#tab-content')
    switch (tab.dataset.tab) {
      case 'elenco':     content.innerHTML = renderElenco(sel);     break
      case 'stats':      content.innerHTML = renderStats(sel);      break
      case 'historico':  content.innerHTML = renderHistorico(sel);  break
      case 'confrontos': content.innerHTML = renderConfrontos(sel); break
    }
  })
}

function renderElenco(sel) {
  if (!sel.elenco?.length) return '<p style="color:var(--color-text-muted);padding:16px">Elenco não disponível.</p>'

  const positions = ['GOL', 'DEF', 'MEI', 'ATA']
  const byPos = {}
  for (const p of sel.elenco) {
    if (!byPos[p.posicao]) byPos[p.posicao] = []
    byPos[p.posicao].push(p)
  }

  return positions.filter(p => byPos[p]).map(pos => `
    <div class="position-group-header">${posLabel(pos)}</div>
    <table class="roster-table">
      <thead><tr><th>#</th><th>Nome</th><th>Clube</th></tr></thead>
      <tbody>
        ${byPos[pos].map(p => `
          <tr>
            <td style="color:var(--color-text-muted);width:32px">${p.numero}</td>
            <td>${p.nome}</td>
            <td style="color:var(--color-text-muted)">${p.clube}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('')
}

function renderStats(sel) {
  const s = sel.stats_torneio
  return `
    <div class="stats-section">
      <table class="stats-table">
        <thead><tr><th>Stat</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Jogos</td><td>${s.jogos}</td></tr>
          <tr><td>Vitórias</td><td>${s.vitorias}</td></tr>
          <tr><td>Empates</td><td>${s.empates}</td></tr>
          <tr><td>Derrotas</td><td>${s.derrotas}</td></tr>
          <tr><td>Gols Marcados</td><td>${s.gols_pro}</td></tr>
          <tr><td>Gols Sofridos</td><td>${s.gols_contra}</td></tr>
          <tr><td>Pontos</td><td style="color:var(--color-accent);font-weight:700">${s.pontos}</td></tr>
        </tbody>
      </table>
    </div>
  `
}

function renderHistorico(sel) {
  if (!sel.titulos_copa && !sel.anos_titulo?.length) {
    return '<p style="color:var(--color-text-muted);padding:16px">Sem títulos mundiais registrados.</p>'
  }
  return `
    <div class="stats-section" style="padding:16px">
      <p style="font-size:var(--font-size-md);margin-bottom:var(--space-sm)">
        🏆 <strong>${sel.titulos_copa}</strong> título${sel.titulos_copa !== 1 ? 's' : ''} da Copa do Mundo
      </p>
      ${sel.anos_titulo?.length ? `
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          ${sel.anos_titulo.map(a => `<span class="chip active">${a}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `
}

function renderConfrontos(sel) {
  if (!sel.confrontos_diretos?.length) {
    return '<p style="color:var(--color-text-muted);padding:16px">Dados de confrontos históricos não disponíveis.</p>'
  }

  return `
    <div class="stats-section">
      <table class="stats-table">
        <thead><tr><th>Adversário</th><th>V</th><th>E</th><th>D</th></tr></thead>
        <tbody>
          ${sel.confrontos_diretos.map(c => {
            const adv = _selecoes.find(s => s.codigo === c.adversario)
            return `
              <tr>
                <td><div class="team-cell">${getFlagImg(c.adversario)} <span>${adv ? adv.nome : c.adversario}</span></div></td>
                <td style="color:var(--color-success)">${c.vitorias}</td>
                <td>${c.empates}</td>
                <td style="color:var(--color-danger)">${c.derrotas}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>
  `
}

function posLabel(pos) {
  return { GOL: 'Goleiros', DEF: 'Defensores', MEI: 'Meio-Campistas', ATA: 'Atacantes' }[pos] || pos
}
