import { fetchJSON, getFlagImg } from '../js/utils.js'

export async function render(container) {
  container.innerHTML = '<div class="spinner">Carregando…</div>'

  let artData, selData
  try {
    ;[artData, selData] = await Promise.all([
      fetchJSON('data/artilharia.json'),
      fetchJSON('data/selecoes.json'),
    ])
  } catch (err) {
    container.innerHTML = `<div class="error-state">Erro ao carregar dados: ${err.message}</div>`
    return
  }

  const selMap = Object.fromEntries(selData.selecoes.map(s => [s.codigo, s]))
  let activeTab = 'artilharia'

  function buildShell() {
    return `
      <div class="section-header"><div class="accent-bar"></div><h2>Estatísticas</h2></div>
      <div class="inner-tabs" id="stats-tabs">
        <div class="inner-tab active" data-tab="artilharia">Artilharia</div>
        <div class="inner-tab" data-tab="selecoes">Por Seleção</div>
        <div class="inner-tab" data-tab="h2h">Head-to-Head</div>
      </div>
      <div id="stats-content">${renderArtilharia(artData.artilheiros)}</div>
    `
  }

  container.innerHTML = buildShell()

  container.querySelector('#stats-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.inner-tab')
    if (!tab) return
    activeTab = tab.dataset.tab
    container.querySelectorAll('.inner-tab').forEach(t => t.classList.toggle('active', t === tab))
    const content = container.querySelector('#stats-content')
    switch (activeTab) {
      case 'artilharia': content.innerHTML = renderArtilharia(artData.artilheiros); break
      case 'selecoes':   content.innerHTML = renderSelStats(selData.selecoes.filter(s=>s.grupo), selMap); break
      case 'h2h':        content.innerHTML = renderH2H(selData.selecoes.filter(s=>s.grupo), selMap); attachH2H(content, selMap); break
    }
  })
}

function renderArtilharia(artilheiros) {
  const sorted = [...artilheiros].sort((a, b) => b.gols - a.gols || b.assistencias - a.assistencias)
  return `
    <div class="stats-section">
      <table class="stats-table">
        <thead>
          <tr><th>#</th><th>Jogador</th><th>Seleção</th><th>Clube</th><th>⚽ Gols</th><th>🎯 Assist.</th></tr>
        </thead>
        <tbody>
          ${sorted.map((p, i) => {
            return `
              <tr>
                <td class="rank-cell${i<3?' top3':''}">${i+1}</td>
                <td><strong>${p.nome}</strong></td>
                <td><div class="team-cell">${getFlagImg(p.selecao)} <span>${p.selecao}</span></div></td>
                <td style="color:var(--color-text-muted)">${p.clube}</td>
                <td><strong>${p.gols}</strong></td>
                <td>${p.assistencias}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderSelStats(selecoes, selMap) {
  const sorted = [...selecoes].sort((a, b) => {
    const sgA = a.stats_torneio.gols_pro - a.stats_torneio.gols_contra
    const sgB = b.stats_torneio.gols_pro - b.stats_torneio.gols_contra
    if (b.stats_torneio.pontos !== a.stats_torneio.pontos) return b.stats_torneio.pontos - a.stats_torneio.pontos
    return sgB - sgA
  })
  return `
    <div class="stats-section">
      <table class="stats-table">
        <thead>
          <tr><th>Seleção</th><th>J</th><th>V</th><th>GP</th><th>GC</th><th>SG</th><th>Pts</th></tr>
        </thead>
        <tbody>
          ${sorted.map(s => {
            const st = s.stats_torneio
            const sg = st.gols_pro - st.gols_contra
            return `
              <tr>
                <td><div class="team-cell">${getFlagImg(s.codigo)}<span class="name">${s.nome}</span></div></td>
                <td>${st.jogos}</td>
                <td>${st.vitorias}</td>
                <td>${st.gols_pro}</td>
                <td>${st.gols_contra}</td>
                <td>${sg >= 0 ? '+' : ''}${sg}</td>
                <td class="pts-cell">${st.pontos}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderH2H(selecoes, selMap) {
  const options = selecoes.map(s => `<option value="${s.codigo}">${s.bandeira} ${s.nome}</option>`).join('')
  return `
    <div class="h2h-selects">
      <select id="h2h-a"><option value="">-- Seleção A --</option>${options}</select>
      <div class="h2h-vs">VS</div>
      <select id="h2h-b"><option value="">-- Seleção B --</option>${options}</select>
    </div>
    <div id="h2h-result">
      <p style="text-align:center;color:var(--color-text-muted);padding:32px">Selecione duas seleções para comparar.</p>
    </div>
  `
}

function attachH2H(content, selMap) {
  function update() {
    const codA = content.querySelector('#h2h-a').value
    const codB = content.querySelector('#h2h-b').value
    const result = content.querySelector('#h2h-result')
    if (!codA || !codB) return
    if (codA === codB) {
      result.innerHTML = '<p style="text-align:center;color:var(--color-danger);padding:16px">Selecione seleções diferentes.</p>'
      return
    }
    const sA = selMap[codA], sB = selMap[codB]
    if (!sA || !sB) return

    const stA = sA.stats_torneio, stB = sB.stats_torneio
    const metrics = [
      { label: 'Gols Marcados',   a: stA.gols_pro,  b: stB.gols_pro  },
      { label: 'Gols Sofridos',   a: stA.gols_contra, b: stB.gols_contra },
      { label: 'Vitórias',        a: stA.vitorias,  b: stB.vitorias  },
      { label: 'Empates',         a: stA.empates,   b: stB.empates   },
      { label: 'Pontos',          a: stA.pontos,    b: stB.pontos    },
    ]

    result.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;text-align:center;margin-bottom:16px;gap:8px">
        <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:12px">
          ${getFlagImg(codA, 64)}
          <div style="font-weight:700">${sA.nome}</div>
        </div>
        <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:12px">
          ${getFlagImg(codB, 64)}
          <div style="font-weight:700">${sB.nome}</div>
        </div>
      </div>
      <div class="h2h-comparison">
        ${metrics.map(m => `
          <div class="h2h-row">
            <span class="h2h-val-a" style="color:${m.a > m.b ? 'var(--color-accent)' : 'var(--color-text-muted)'}">${m.a}</span>
            <span class="h2h-label">${m.label}</span>
            <span class="h2h-val-b" style="color:${m.b > m.a ? 'var(--color-accent)' : 'var(--color-text-muted)'}">${m.b}</span>
          </div>
        `).join('')}
      </div>
    `
  }

  content.querySelector('#h2h-a').addEventListener('change', update)
  content.querySelector('#h2h-b').addEventListener('change', update)
}
