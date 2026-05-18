// Diagnóstico: encuentra empresa "Energizer", sus clientes, y todas sus citas
// (sin filtros de ejecutivo). Útil para entender por qué no aparecen en la UI.
//
// Uso (apuntando a producción):
//   DATABASE_URL='postgresql://USER:PASS@HOST:5432/DB' node scripts/diagnose-energizer.mjs
//   (opcionalmente pasa otro nombre)  ... node scripts/diagnose-energizer.mjs "Energizer"

import { PrismaClient } from '@prisma/client'

const nombreBuscar = process.argv[2] || 'Energizer'
const prisma = new PrismaClient()

async function main() {
  console.log(`\n=== Buscando empresas que contengan: "${nombreBuscar}" ===\n`)

  const empresas = await prisma.empresa.findMany({
    where: { nombre: { contains: nombreBuscar, mode: 'insensitive' } },
    include: {
      ejecutivo: { select: { id: true, nombre: true, activo: true } },
      clientes: { select: { id: true, nombre: true } },
    },
  })

  if (empresas.length === 0) {
    console.log('No se encontró ninguna empresa con ese nombre.')
    return
  }

  for (const emp of empresas) {
    console.log(`Empresa: ${emp.nombre}  (id=${emp.id})`)
    console.log(`  Ejecutivo asignado: ${emp.ejecutivo?.nombre ?? '—'}  (id=${emp.ejecutivoId})  activo=${emp.ejecutivo?.activo}`)
    console.log(`  Clientes: ${emp.clientes.length}`)
    for (const c of emp.clientes) console.log(`    - ${c.nombre}  (id=${c.id})`)

    const clienteIds = emp.clientes.map(c => c.id)
    if (clienteIds.length === 0) {
      console.log('  Sin clientes; por eso no aparecen citas.\n')
      continue
    }

    const citas = await prisma.citaComercial.findMany({
      where: { clienteId: { in: clienteIds } },
      include: {
        ejecutivo: { select: { id: true, nombre: true, activo: true } },
        cliente: { select: { nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`  Citas comerciales (total ${citas.length}):`)
    if (citas.length === 0) {
      console.log('    (no hay citas en BD para los clientes de esta empresa)')
    }
    for (const ct of citas) {
      console.log(
        `    - ${ct.dia} ${ct.horario}  status=${ct.status}  ` +
        `cliente="${ct.cliente.nombre}"  ` +
        `ejecutivo="${ct.ejecutivo.nombre}" (id=${ct.ejecutivoId}, activo=${ct.ejecutivo.activo})  ` +
        `created=${ct.createdAt.toISOString()}`
      )
    }
    console.log('')
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
