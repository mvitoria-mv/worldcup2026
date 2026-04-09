import { fetchJSON, formatNumber, getCountryFlagImg } from '../js/utils.js'

const COUNTRY_ORDER = ['EUA', 'México', 'Canadá']

export async function render(container) {
  container.innerHTML = '<div class="spinner">Carregando…</div>'

  let sedesData
  try {
    sedesData = await fetchJSON('data/sedes.json')
  } catch (err) {
    container.innerHTML = `<div class="error-state">Erro ao carregar dados: ${err.message}</div>`
    return
  }

  const byCountry = {}
  for (const s of sedesData.sedes) {
    if (!byCountry[s.pais]) byCountry[s.pais] = []
    byCountry[s.pais].push(s)
  }

  container.innerHTML = `
    <div class="section-header"><div class="accent-bar"></div><h2>Sedes</h2></div>
    ${COUNTRY_ORDER.map(pais => {
      const sedes = byCountry[pais] || []
      const totalJogos = sedes.reduce((acc, s) => acc + s.jogos, 0)
      return `
        <div class="country-section">
          <div class="country-header">
            ${getCountryFlagImg(pais)}
            <h3>${pais}</h3>
            <span class="game-count">${sedes.length} estádio${sedes.length !== 1 ? 's' : ''} · ${totalJogos} jogos</span>
          </div>
          <div class="venues-grid">
            ${sedes.map(s => buildVenueCard(s)).join('')}
          </div>
        </div>
      `
    }).join('')}
  `
}

function buildVenueCard(sede) {
  return `
    <div class="venue-card">
      <h4>${sede.estadio}</h4>
      <div class="city">${getCountryFlagImg(sede.pais)} ${sede.cidade}</div>
      ${sede.destaque ? `<div style="font-size:var(--font-size-xs);color:var(--color-accent);margin-bottom:8px">${sede.destaque}</div>` : ''}
      <div class="venue-stats">
        <div class="venue-stat">
          <span class="stat-label">Capacidade</span>
          <span class="stat-value">${formatNumber(sede.capacidade)}</span>
        </div>
        <div class="venue-stat">
          <span class="stat-label">Jogos</span>
          <span class="stat-value">${sede.jogos}</span>
        </div>
      </div>
    </div>
  `
}
