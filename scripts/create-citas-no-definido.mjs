// Crea CitaComercial "Día 1" "Tentativa" para clientes que en el Excel
// "Registros VIP.xlsx" hoja Marketing marcaron "No lo tengo definido".
//
// - Lookup en bulk (una sola query a Neon) para evitar timeouts.
// - Empareja por email (case-insensitive).
// - Asigna al ejecutivo ACTUAL de la empresa del cliente.
// - Idempotente: salta clientes que ya tienen una cita en Día 1.
// - Dry-run por defecto. Para aplicar: --apply
//
// Uso:
//   DATABASE_URL='...' node scripts/create-citas-no-definido.mjs
//   DATABASE_URL='...' node scripts/create-citas-no-definido.mjs --apply

import xlsx from 'xlsx'
import { PrismaClient } from '@prisma/client'

const APPLY = process.argv.includes('--apply')
const prisma = new PrismaClient()

async function main() {
  // 1) Read Excel
  const wb = xlsx.readFile('Registros VIP.xlsx')
  const sheetName = wb.SheetNames.includes('Marketing') ? 'Marketing' : wb.SheetNames[0]
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '', raw: false })
  console.log(`Leyendo hoja "${sheetName}" (${rows.length} filas)`)

  const emailsTarget = new Set()
  for (const r of rows) {
    const dia = (r['¿Qué día te gustaría asistir a Expo Publicitas?'] || '').toLowerCase().trim()
    if (dia !== 'no lo tengo definido') continue
    const email = (r['Email'] || '').toLowerCase().trim()
    if (email.includes('@')) emailsTarget.add(email)
  }
  console.log(`Emails únicos con "No lo tengo definido": ${emailsTarget.size}\n`)

  // 2) Single bulk lookup
  const clientes = await prisma.cliente.findMany({
    where: { email: { in: [...emailsTarget], mode: 'insensitive' } },
    include: {
      empresa: { select: { id: true, nombre: true, ejecutivoId: true, ejecutivo: { select: { nombre: true } } } },
      citasComerciales: { where: { dia: 'Día 1' }, select: { id: true } },
    },
  })
  const byEmail = new Map(clientes.map(c => [c.email.toLowerCase(), c]))

  // 3) Decide actions
  const toCreate = []
  const skipped = { noEncontrado: [], sinEjecutivo: [], yaTieneDia1: [] }
  for (const email of emailsTarget) {
    const c = byEmail.get(email)
    if (!c) { skipped.noEncontrado.push(email); continue }
    if (!c.empresa.ejecutivoId) { skipped.sinEjecutivo.push(`${c.nombre} (${c.empresa.nombre})`); continue }
    if (c.citasComerciales.length > 0) { skipped.yaTieneDia1.push(`${c.nombre} (${c.empresa.nombre})`); continue }
    toCreate.push({
      ejecutivoId: c.empresa.ejecutivoId,
      clienteId: c.id,
      dia: 'Día 1',
      status: 'Tentativa',
      horario: '',
      transporte: '',
      notas: 'Asignación automática: marcó "No lo tengo definido"',
      _meta: { cliente: c.nombre, empresa: c.empresa.nombre, ejec: c.empresa.ejecutivo?.nombre },
    })
  }

  console.log(`A crear: ${toCreate.length}`)
  console.log(`Saltadas — ya tienen Día 1: ${skipped.yaTieneDia1.length}`)
  console.log(`Saltadas — empresa sin ejecutivo: ${skipped.sinEjecutivo.length}`)
  console.log(`Saltadas — cliente no encontrado: ${skipped.noEncontrado.length}`)

  if (skipped.noEncontrado.length) {
    console.log(`\n  No encontrados:`)
    for (const e of skipped.noEncontrado) console.log(`    · ${e}`)
  }
  if (skipped.sinEjecutivo.length) {
    console.log(`\n  Empresa sin ejecutivo:`)
    for (const e of skipped.sinEjecutivo) console.log(`    · ${e}`)
  }

  console.log(`\n${APPLY ? '=== APLICANDO ===' : '=== DRY-RUN (sin --apply) ==='}`)
  for (const t of toCreate) {
    console.log(`  ${APPLY ? '✓' : '→'} ${t._meta.cliente} — ${t._meta.empresa} → Día 1 (ejec: ${t._meta.ejec})`)
  }

  if (APPLY && toCreate.length > 0) {
    const data = toCreate.map(({ _meta, ...d }) => d)
    const result = await prisma.citaComercial.createMany({ data })
    console.log(`\n✓ Insertadas en BD: ${result.count}`)
  } else if (!APPLY) {
    console.log(`\nPara aplicar de verdad: re-ejecutar con --apply`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
