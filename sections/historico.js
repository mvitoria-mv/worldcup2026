import { fetchJSON, getFlagImg, getCountryFlagImg } from '../js/utils.js'

export async function render(container) {
  container.innerHTML = '<div class="spinner">Carregando…</div>'

  let histData, selData
  try {
    ;[histData, selData] = await Promise.all([
      fetchJSON('data/historico.json'),
      fetchJSON('data/selecoes.json'),
    ])
  } catch (err) {
    container.innerHTML = `<div class="error-state">Erro ao carregar dados: ${err.message}</div>`
    return
  }

  const selMap = Object.fromEntries(selData.selecoes.map(s => [s.codigo, s]))
  const copas = [...histData.copas].reverse()

  const titulos = {}
  for (const c of histData.copas) {
    titulos[c.campeao] = (titulos[c.campeao] || 0) + 1
  }
  const rankingTitulos = Object.entries(titulos)
    .sort((a, b) => b[1] - a[1])
    .map(([cod, n]) => ({ cod, n }))

  container.innerHTML = `
    <div class="section-header"><div class="accent-bar"></div><h2>Histórico de Copas</h2></div>

    <div class="section-header" style="margin-top:0;margin-bottom:12px">
      <div class="accent-bar"></div><h3 style="font-size:var(--font-size-md)">Ranking de Títulos</h3>
    </div>
    <div class="titles-ranking" style="margin-bottom:32px">
      ${rankingTitulos.map((item, i) => {
        const sel = selMap[item.cod] || { bandeira: '🏳️', nome: item.cod }
        const anos = histData.copas.filter(c => c.campeao === item.cod).map(c => c.ano)
        return `
          <div class="titles-row">
            <span class="rank">${i+1}</span>
            ${getFlagImg(item.cod)}
            <span class="tname">${sel.nome}</span>
            <span class="count">${item.n}</span>
            <span class="years">${anos.join(', ')}</span>
          </div>
        `
      }).join('')}
    </div>

    <div class="section-header" style="margin-bottom:12px">
      <div class="accent-bar"></div><h3 style="font-size:var(--font-size-md)">Recordes Históricos</h3>
    </div>
    <div class="records-grid" style="margin-bottom:32px">
      <div class="record-card">
        <div class="record-label">Maior Artilheiro</div>
        <div class="record-value">${histData.recordes.maior_artilheiro.gols} gols</div>
        <div class="record-desc">${histData.recordes.maior_artilheiro.nome} (${selMap[histData.recordes.maior_artilheiro.selecao]?.nome || histData.recordes.maior_artilheiro.selecao}) · ${histData.recordes.maior_artilheiro.edicoes}</div>
      </div>
      <div class="record-card">
        <div class="record-label">Maior Goleada</div>
        <div class="record-value">${histData.recordes.maior_goleada.jogo}</div>
        <div class="record-desc">Copa de ${histData.recordes.maior_goleada.ano}</div>
      </div>
      <div class="record-card">
        <div class="record-label">Edição com Mais Gols</div>
        <div class="record-value">${histData.recordes.mais_gols_edicao.total} gols</div>
        <div class="record-desc">Copa de ${histData.recordes.mais_gols_edicao.ano} · ${histData.recordes.mais_gols_edicao.media_por_jogo} por jogo</div>
      </div>
      <div class="record-card">
        <div class="record-label">País com Mais Títulos</div>
        <div class="record-value">${selMap[histData.recordes.mais_titulos.selecao]?.bandeira} ${histData.recordes.mais_titulos.titulos}×</div>
        <div class="record-desc">${selMap[histData.recordes.mais_titulos.selecao]?.nome || histData.recordes.mais_titulos.selecao}</div>
      </div>
    </div>

    <div class="section-header" style="margin-bottom:12px">
      <div class="accent-bar"></div><h3 style="font-size:var(--font-size-md)">Todas as Copas</h3>
    </div>
    <div class="history-timeline">
      ${copas.map(c => buildCopaCard(c, selMap)).join('')}
    </div>
  `
}

function buildCopaCard(copa, selMap) {
  const campeao = selMap[copa.campeao] || { bandeira: '🏳️', nome: copa.campeao }
  const vice = selMap[copa.vice] || { bandeira: '🏳️', nome: copa.vice }
  const terceiro = selMap[copa.terceiro] || { bandeira: '🏳️', nome: copa.terceiro }

  return `
    <div class="history-card">
      <div class="history-year">${copa.ano}</div>
      <div class="history-info">
        <h3>${getFlagImg(copa.campeao)} ${campeao.nome}</h3>
        <div class="meta">
          <span>📍 ${getCountryFlagImg(copa.sede)} ${copa.sede}</span>
          <span>🥇 ${campeao.nome}</span>
          <span>🥈 ${getFlagImg(copa.vice)} ${vice.nome}</span>
          <span>🥉 ${getFlagImg(copa.terceiro)} ${terceiro.nome}</span>
          <span>⚽ ${copa.artilheiro.nome} (${copa.artilheiro.gols}g)</span>
          <span>📊 ${copa.total_gols} gols em ${copa.total_jogos} jogos</span>
        </div>
      </div>
    </div>
  `
}
