import { fetchJSON, sortStandings, getFlagImg } from '../js/utils.js'

export async function render(container) {
  container.innerHTML = '<div class="spinner">Carregando…</div>'

  let gruposData, selecoesData
  try {
    ;[gruposData, selecoesData] = await Promise.all([
      fetchJSON('data/grupos.json'),
      fetchJSON('data/selecoes.json'),
    ])
  } catch (err) {
    container.innerHTML = `<div class="error-state">Erro ao carregar dados: ${err.message}</div>`
    return
  }

  const selMap = Object.fromEntries(selecoesData.selecoes.map(s => [s.codigo, s]))

  container.innerHTML = `
    <div class="section-header"><div class="accent-bar"></div><h2>Grupos</h2></div>
    <div class="groups-grid">
      ${gruposData.grupos.map(g => buildGroupCard(g, selMap)).join('')}
    </div>
  `
}

function buildGroupCard(grupo, selMap) {
  const sorted = sortStandings(grupo.classificacao)
  const rows = sorted.map((entry, idx) => {
    const sel = selMap[entry.codigo] || { nome: entry.codigo, bandeira: '🏳️' }
    const isQ = idx < 2
    return `
      <tr class="${isQ ? 'qualified' : ''}">
        <td>
          <div class="team-cell">
            ${getFlagImg(entry.codigo)}
            <span class="name">${sel.nome}</span>
          </div>
        </td>
        <td>${entry.j}</td>
        <td>${entry.v}</td>
        <td>${entry.e}</td>
        <td>${entry.d}</td>
        <td>${entry.gp}</td>
        <td>${entry.gc}</td>
        <td>${entry.sg >= 0 ? '+' : ''}${entry.sg}</td>
        <td class="pts-cell">${entry.pts}</td>
      </tr>
    `
  }).join('')

  return `
    <div class="group-card">
      <div class="group-card-header">Grupo ${grupo.id}</div>
      <table class="standings-table">
        <thead>
          <tr>
            <th>Seleção</th>
            <th>J</th><th>V</th><th>E</th><th>D</th>
            <th>GP</th><th>GC</th><th>SG</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}
