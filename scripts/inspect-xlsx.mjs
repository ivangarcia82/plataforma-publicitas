import xlsx from 'xlsx'

const wb = xlsx.readFile('Registros VIP.xlsx')
console.log('Sheets:', wb.SheetNames)

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name]
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false })
  console.log(`\n=== Sheet "${name}" — ${rows.length} rows ===`)
  console.log('Header row:', rows[0])
  console.log('First 3 data rows:')
  for (let i = 1; i <= Math.min(3, rows.length - 1); i++) {
    console.log(`  Row ${i}:`, rows[i])
  }
  console.log(`Total data rows: ${rows.length - 1}`)
}
