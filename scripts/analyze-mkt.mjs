import xlsx from 'xlsx'

const wb = xlsx.readFile('Registros VIP.xlsx')
const ws = wb.Sheets['MKT']
const rows = xlsx.utils.sheet_to_json(ws, { defval: '', raw: false })

console.log(`Total rows: ${rows.length}`)

// Unique ejecutivos
const ejecutivosSet = new Set()
const domainsMap = new Map() // domain -> { company, ejecutivo, count }
const diasCount = new Map()
let withoutEmail = 0
let withoutEjecutivo = 0

for (const r of rows) {
  const ej = (r['Ejecutivo'] || '').trim()
  if (!ej) { withoutEjecutivo++; continue }
  ejecutivosSet.add(ej)

  const email = (r['Email'] || '').trim().toLowerCase()
  if (!email || !email.includes('@')) { withoutEmail++; continue }
  const domain = email.split('@')[1]

  if (!domainsMap.has(domain)) {
    domainsMap.set(domain, { company: r['Company'] || '', ejecutivo: ej, count: 0 })
  }
  domainsMap.get(domain).count++

  const dia = (r['¿Qué día te gustaría asistir a Expo Publicitas?'] || '').trim()
  diasCount.set(dia, (diasCount.get(dia) || 0) + 1)
}

console.log(`\nUnique ejecutivos (${ejecutivosSet.size}):`)
for (const e of [...ejecutivosSet].sort()) console.log(`  - ${e}`)

console.log(`\nUnique email domains (empresas, ${domainsMap.size}):`)
const sortedDomains = [...domainsMap.entries()].sort((a,b) => b[1].count - a[1].count)
for (const [d, info] of sortedDomains.slice(0, 20)) {
  console.log(`  ${d.padEnd(35)} | ${info.count.toString().padStart(3)} VIPs | ${info.company.padEnd(20)} | ejec: ${info.ejecutivo}`)
}
if (sortedDomains.length > 20) console.log(`  ... and ${sortedDomains.length - 20} more`)

console.log(`\nDía counts:`)
for (const [d, c] of [...diasCount.entries()].sort((a,b) => b[1] - a[1])) {
  console.log(`  ${(d || '(empty)').padEnd(40)} | ${c}`)
}

console.log(`\nRows without ejecutivo: ${withoutEjecutivo}`)
console.log(`Rows without valid email: ${withoutEmail}`)
