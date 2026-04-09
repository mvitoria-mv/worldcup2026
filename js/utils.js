// ============================================================
// FETCH
// ============================================================
export async function fetchJSON(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Erro ao carregar ${path}: ${res.status}`)
  return res.json()
}

// ============================================================
// DATAS
// ============================================================
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export function formatDate(dateStr) {
  // "2026-06-11" → "11 Jun"
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS_PT[parseInt(m) - 1]}`
}

export function formatTime(timeStr) {
  // "15:00" → "15h00"
  const [h, min] = timeStr.split(':')
  return `${h}h${min}`
}

export function formatDateLabel(dateStr) {
  const today = new Date()
  const todayStr = toLocalDateStr(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = toLocalDateStr(tomorrow)

  if (dateStr === todayStr) return 'Hoje'
  if (dateStr === tomorrowStr) return 'Amanhã'
  return formatDate(dateStr)
}

function toLocalDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ============================================================
// BANDEIRAS — flagsapi.com (código FIFA → ISO 3166-1 alpha-2)
// ============================================================
const FIFA_TO_ISO2 = {
  AFG:'AF', ALB:'AL', ALG:'DZ', AND:'AD', ANG:'AO', ARG:'AR', ARM:'AM',
  AUS:'AU', AUT:'AT', AZE:'AZ', BDI:'BI', BEL:'BE', BEN:'BJ', BFA:'BF',
  BHR:'BH', BIH:'BA', BOL:'BO', BRA:'BR', BRN:'BN', BUL:'BG', CAN:'CA',
  CHI:'CL', CHN:'CN', CIV:'CI', CMR:'CM', COD:'CD', COG:'CG', COL:'CO',
  CPV:'CV', CRC:'CR', CRO:'HR', CUB:'CU', CUW:'CW', CZE:'CZ', DEN:'DK',
  ECU:'EC', EGY:'EG', ENG:'GB', ESP:'ES', ETH:'ET', FIN:'FI', FRA:'FR',
  GAB:'GA', GEO:'GE', GER:'DE', GHA:'GH', GRE:'GR', GTM:'GT', GUI:'GN',
  GUY:'GY', HAI:'HT', HND:'HN', HRV:'HR', HUN:'HU', IDN:'ID', IND:'IN',
  IRN:'IR', IRQ:'IQ', IRL:'IE', ISL:'IS', ISR:'IL', ITA:'IT', JAM:'JM',
  JOR:'JO', JPN:'JP', KAZ:'KZ', KEN:'KE', KOR:'KR', KSA:'SA', KUW:'KW',
  LBN:'LB', LBY:'LY', MAR:'MA', MEX:'MX', MLI:'ML', MLT:'MT', MNE:'ME',
  MOZ:'MZ', MRT:'MR', MWI:'MW', MYS:'MY', NAM:'NA', NED:'NL', NGA:'NG',
  NOR:'NO', NZL:'NZ', OMN:'OM', PAK:'PK', PAN:'PA', PAR:'PY', PER:'PE',
  POL:'PL', POR:'PT', PRK:'KP', QAT:'QA', ROU:'RO', RSA:'ZA', RUS:'RU',
  SCO:'GB', SEN:'SN', SLO:'SI', SRB:'RS', SUI:'CH', SVK:'SK', SWE:'SE',
  SYR:'SY', TAN:'TZ', THA:'TH', TTO:'TT', TUN:'TN', TUR:'TR', UAE:'AE',
  UGA:'UG', UKR:'UA', URU:'UY', USA:'US', UZB:'UZ', VEN:'VE', VNM:'VN',
  WAL:'GB', YEM:'YE', ZAM:'ZM', ZIM:'ZW',
}

// Sede (nome em português) → ISO 3166-1 alpha-2
const COUNTRY_NAME_TO_ISO2 = {
  'Uruguai':'UY', 'Itália':'IT', 'França':'FR', 'Brasil':'BR',
  'Suíça':'CH', 'Suécia':'SE', 'Chile':'CL', 'Inglaterra':'GB',
  'México':'MX', 'Alemanha Ocidental':'DE', 'Argentina':'AR',
  'Espanha':'ES', 'EUA':'US', 'Alemanha':'DE', 'África do Sul':'ZA',
  'Rússia':'RU', 'Qatar':'QA', 'Canadá':'CA',
}

export function getFlagImg(codigoFIFA, size = 64, style = 'flat') {
  const iso2 = FIFA_TO_ISO2[codigoFIFA]
  if (!iso2) return '<span style="opacity:0.4">🏳️</span>'
  return `<img src="https://flagsapi.com/${iso2}/${style}/${size}.png" class="flag-img" alt="${codigoFIFA}" loading="lazy">`
}

export function getCountryFlagImg(name, size = 64, style = 'flat') {
  if (name === 'Coreia/Japão') {
    return `<img src="https://flagsapi.com/KR/${style}/${size}.png" class="flag-img" alt="Coreia" loading="lazy"><img src="https://flagsapi.com/JP/${style}/${size}.png" class="flag-img" alt="Japão" loading="lazy">`
  }
  const iso2 = COUNTRY_NAME_TO_ISO2[name]
  if (!iso2) return ''
  return `<img src="https://flagsapi.com/${iso2}/${style}/${size}.png" class="flag-img" alt="${name}" loading="lazy">`
}

// ============================================================
// ORDENAÇÃO
// ============================================================
export function sortByDate(jogos) {
  return [...jogos].sort((a, b) => {
    const da = a.data + 'T' + a.hora
    const db = b.data + 'T' + b.hora
    return da < db ? -1 : da > db ? 1 : 0
  })
}

export function sortStandings(classificacao) {
  return [...classificacao].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    const sgA = a.gp - a.gc, sgB = b.gp - b.gc
    if (sgB !== sgA) return sgB - sgA
    return b.gp - a.gp
  })
}

// ============================================================
// FORMATAÇÃO DE NÚMEROS
// ============================================================
export function formatNumber(n) {
  return n.toLocaleString('pt-BR')
}

// ============================================================
// AGRUPAMENTO DE JOGOS POR DATA
// ============================================================
export function groupByDate(jogos) {
  const map = new Map()
  for (const jogo of jogos) {
    if (!map.has(jogo.data)) map.set(jogo.data, [])
    map.get(jogo.data).push(jogo)
  }
  return map
}
