// Import StaffMembers from "StaffNuevo.xlsx".
//
// Input columns: #, Sección*, Rol, Colaborador, Días de asistencia
//
// Mapping rules:
// - nombre        ← Colaborador
// - rol           ← Rol (preserved verbatim; UI shows "Líder", "Coordinador" or "Staff" badges, others render as neutral)
// - seccion       ← Sección
// - diasAsignados ← derived from "Días de asistencia" (number)
//     3 → ["Día 1", "Día 2", "Día 3"]
//     2 → ["Día 1", "Día 2"]  (best guess — admin should review)
//     1 → ["Día 1"]
//     0/empty → all three days
// - horarioEntrada / horarioSalida ← defaults "09:00" / "18:00" (admin edits later)
// - email, telefono, viaticoCantidad ← empty (admin fills later)
// - activo ← true
//
// Existing StaffMembers are matched by (nombre + seccion). Re-running updates
// rol/days for the same person; it does NOT delete anyone or wipe gastos.
//
// Usage:
//   node scripts/import-staff.mjs                  # uses DATABASE_URL from .env
//   DATABASE_URL="<prod-url>" node scripts/import-staff.mjs

import xlsx from 'xlsx'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_ENTRADA = '09:00'
const DEFAULT_SALIDA = '18:00'

function normalizeRol(raw) {
  const r = String(raw || '').trim()
  if (!r) return 'Staff'
  const upper = r.toUpperCase()
  if (upper === 'STAFF') return 'Staff'
  if (upper.startsWith('LÍDER') || upper.startsWith('LIDER')) return 'Líder'
  if (upper.startsWith('COORD')) return 'Coordinador'
  // Supervisor / Dirección / Contenido / etc. — treat as Coordinador for the badge
  return 'Coordinador'
}

function daysFromCount(n) {
  const num = Number(n)
  if (num === 1) return ['Día 1']
  if (num === 2) return ['Día 1', 'Día 2']
  if (num === 3) return ['Día 1', 'Día 2', 'Día 3']
  return ['Día 1', 'Día 2', 'Día 3']
}

async function main() {
  const wb = xlsx.readFile('StaffNuevo.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '', raw: false })

  console.log(`Read ${rows.length} rows from sheet "${wb.SheetNames[0]}"\n`)

  let created = 0
  let updated = 0
  let skipped = 0
  const warnings = []

  for (const row of rows) {
    const nombre = String(row['Colaborador'] || '').trim()
    const seccion = String(row['Sección*'] || row['Sección'] || '').trim()
    const rolRaw = String(row['Rol'] || '').trim()
    const dias = row['Días de asistencia']

    if (!nombre) { skipped++; continue }

    const rol = normalizeRol(rolRaw)
    const diasAsignados = daysFromCount(dias)

    if (!dias || Number(dias) === 0) {
      warnings.push(`⚠ "${nombre}" sin "Días de asistencia" — se asignaron los 3 días por defecto.`)
    } else if (Number(dias) === 2) {
      warnings.push(`ℹ "${nombre}" tiene 2 días — asumí "Día 1" y "Día 2". Revisa si era otro par.`)
    }

    const existing = await prisma.staffMember.findFirst({
      where: { nombre, seccion },
    })

    const data = {
      nombre,
      rol,
      seccion,
      diasAsignados,
      horarioEntrada: existing?.horarioEntrada || DEFAULT_ENTRADA,
      horarioSalida: existing?.horarioSalida || DEFAULT_SALIDA,
      horaComida: existing?.horaComida || '',
      viaticoCantidad: existing?.viaticoCantidad ?? 0,
      viaticoStatus: existing?.viaticoStatus || 'Pendiente',
      email: existing?.email || '',
      telefono: existing?.telefono || '',
      activo: existing?.activo ?? true,
    }

    if (existing) {
      await prisma.staffMember.update({
        where: { id: existing.id },
        data: { rol: data.rol, diasAsignados: data.diasAsignados, seccion: data.seccion },
      })
      updated++
      console.log(`  ↻ Updated: ${nombre} (${seccion}) — ${rol} — ${diasAsignados.length} día(s)`)
    } else {
      await prisma.staffMember.create({ data })
      created++
      console.log(`  + Created: ${nombre} (${seccion}) — ${rol} — ${diasAsignados.length} día(s)`)
    }
  }

  console.log(`\nResumen:`)
  console.log(`  Creados:    ${created}`)
  console.log(`  Actualizados: ${updated}`)
  console.log(`  Ignorados (sin nombre): ${skipped}`)

  if (warnings.length) {
    console.log(`\nAvisos:`)
    for (const w of warnings) console.log(`  ${w}`)
  }
}

try {
  await main()
} catch (e) {
  console.error('Error:', e)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
