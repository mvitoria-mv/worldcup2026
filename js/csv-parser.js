// ============================================================
// CSV Parser — handles quoted fields, Windows line endings
// ============================================================
export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  const headers = parseLine(lines[0]).map(h => h.trim())
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const values = parseLine(line)
      const obj = {}
      headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim() })
      return obj
    })
}

function parseLine(line) {
  const result = []
  let cur = ''
  let inQ  = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if (c === ',' && !inQ) {
      result.push(cur); cur = ''
    } else {
      cur += c
    }
  }
  result.push(cur)
  return result
}
