// Configura los managers de venta y su visibilidad sobre el equipo.
//
// Reglas:
// - jrios@generandoideas.com (Strategic Sales Manager) → todos los ejecutivos
//   con cargo "· Strategic Sales" (excluyéndose a sí mismo).
// - gquinones@generandoideas.com (Inside Sales Manager) → todos con
//   cargo "· Inside Sales" (excluyéndose a sí mismo). Acepta también la
//   typo "Indise Sales".
// - aquiroz@generandoideas.com → SOLO Noé Osiel Sánchez Colín.
//
// Idempotente: sobrescribe managedEjecutivoIds de cada manager con el set actual.
// Dry-run por defecto. Para aplicar: --apply
//
// Uso:
//   DATABASE_URL='...' node scripts/setup-managers.mjs
//   DATABASE_URL='...' node scripts/setup-managers.mjs --apply

import { PrismaClient } from '@prisma/client'

const APPLY = process.argv.includes('--apply')
const prisma = new PrismaClient()

function isInArea(cargo, area) {
  const c = (cargo || '').toLowerCase()
  if (area === 'Strategic Sales') return c.includes('· strategic sales') || c.endsWith('strategic sales')
  if (area === 'Inside Sales') return c.includes('· inside sales') || c.endsWith('inside sales') || c.includes('indise sales')
  return false
}

async function getEjecutivosInArea(area) {
  const all = await prisma.ejecutivo.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })
  return all.filter(e => isInArea(e.cargo, area))
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email }, include: { ejecutivo: { select: { id: true, nombre: true } } } })
}

async function main() {
  const jrios = await findUserByEmail('jrios@generandoideas.com')
  const gquinones = await findUserByEmail('gquinones@generandoideas.com')
  const aquiroz = await findUserByEmail('aquiroz@generandoideas.com')

  if (!jrios) throw new Error('Usuario jrios@generandoideas.com no encontrado')
  if (!gquinones) throw new Error('Usuario gquinones@generandoideas.com no encontrado')
  if (!aquiroz) throw new Error('Usuario aquiroz@generandoideas.com no encontrado')

  const ss = await getEjecutivosInArea('Strategic Sales')
  const is = await getEjecutivosInArea('Inside Sales')

  // Noé Sánchez para aquiroz
  const noe = await prisma.ejecutivo.findFirst({
    where: { nombre: { contains: 'Noé Osiel Sánchez', mode: 'insensitive' } },
    select: { id: true, nombre: true },
  })
  if (!noe) throw new Error('No se encontró ejecutivo "Noé Osiel Sánchez Colín"')

  const plans = [
    {
      user: jrios,
      label: 'jrios → Strategic Sales (todos)',
      managedIds: ss.filter(e => e.id !== jrios.ejecutivoId).map(e => e.id),
      previewNombres: ss.filter(e => e.id !== jrios.ejecutivoId).map(e => e.nombre),
    },
    {
      user: gquinones,
      label: 'gquinones → Inside Sales (todos)',
      managedIds: is.filter(e => e.id !== gquinones.ejecutivoId).map(e => e.id),
      previewNombres: is.filter(e => e.id !== gquinones.ejecutivoId).map(e => e.nombre),
    },
    {
      user: aquiroz,
      label: 'aquiroz → SOLO Noé Sánchez',
      managedIds: [noe.id],
      previewNombres: [noe.nombre],
    },
  ]

  console.log(`Modo: ${APPLY ? 'APPLY (escribe a BD)' : 'DRY-RUN (sin --apply)'}\n`)
  for (const p of plans) {
    console.log(`${p.label}  (user.id=${p.user.id}, ejecutivo=${p.user.ejecutivo?.nombre})`)
    console.log(`  visibilidad anterior: ${p.user.managedEjecutivoIds.length} ejecutivo(s)`)
    console.log(`  visibilidad nueva: ${p.managedIds.length} ejecutivo(s)`)
    for (const n of p.previewNombres) console.log(`    · ${n}`)
    if (APPLY) {
      await prisma.user.update({
        where: { id: p.user.id },
        data: { managedEjecutivoIds: p.managedIds },
      })
      console.log(`  ✓ aplicado`)
    }
    console.log('')
  }

  if (!APPLY) console.log('Para aplicar de verdad: re-ejecutar con --apply')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
