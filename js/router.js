const ROUTES = {
  home:         () => import('../sections/home.js'),
  jogos:        () => import('../sections/jogos.js'),
  grupos:       () => import('../sections/grupos.js'),
  selecoes:     () => import('../sections/selecoes.js'),
  estatisticas: () => import('../sections/estatisticas.js'),
  historico:    () => import('../sections/historico.js'),
  sedes:        () => import('../sections/sedes.js'),
  membros:      () => import('../sections/membros.js'),
}

const app = document.getElementById('app')
const tabLinks = document.querySelectorAll('.tab-link')

function getSection() {
  const hash = window.location.hash.slice(1)
  return ROUTES[hash] ? hash : 'home'
}

function setActiveTab(section) {
  tabLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === section)
  })
}

async function navigate() {
  const section = getSection()
  setActiveTab(section)
  app.innerHTML = '<div class="spinner">Carregando…</div>'

  try {
    const mod = await ROUTES[section]()
    await mod.render(app)
  } catch (err) {
    console.error(err)
    app.innerHTML = `<div class="error-state">Erro ao carregar a seção. Verifique o console.</div>`
  }
}

document.addEventListener('DOMContentLoaded', navigate)
window.addEventListener('hashchange', navigate)
