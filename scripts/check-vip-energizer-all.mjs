// Busca cualquier mención de "energizer" en el Excel VIP (todas las columnas, todas las hojas)
import xlsx from 'xlsx'

const wb = xlsx.readFile('Registros VIP.xlsx')

console.log('Hojas:', wb.SheetNames)

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName]
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '', raw: false })
  const matches = rows.filter(r =>
    Object.values(r).some(v => String(v).toLowerCase().includes('energizer'))
  )
  console.log(`\n--- Hoja "${sheetName}": ${matches.length} filas con "energizer" ---`)
  for (const r of matches) {
    console.log(r)
  }
}
