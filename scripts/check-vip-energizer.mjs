// Lee "Registros VIP.xlsx" y muestra las filas cuyo email termina en @energizer.com
import xlsx from 'xlsx'

const wb = xlsx.readFile('Registros VIP.xlsx')
const ws = wb.Sheets['MKT']
const rows = xlsx.utils.sheet_to_json(ws, { defval: '', raw: false })

const matches = rows.filter(r => ((r['Email'] || '').toLowerCase()).endsWith('@energizer.com'))
console.log(`Filas con dominio energizer.com: ${matches.length}\n`)

for (const r of matches) {
  console.log({
    nombre: `${r['First name']} ${r['Last name']}`.trim(),
    email: r['Email'],
    company: r['Company'],
    cargo: r['Cargo / área'],
    ejecutivo: r['Ejecutivo'],
    dia: r['¿Qué día te gustaría asistir a Expo Publicitas?'],
    phone: r['Phone number'],
  })
}
