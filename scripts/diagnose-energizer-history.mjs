import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const empId = 'cmp65a0q7002ov3id0s2y7ton' // Energizer

  console.log('\n=== Clientes de Energizer: createdAt / updatedAt ===')
  const clientes = await prisma.cliente.findMany({
    where: { empresaId: empId },
    select: { id: true, nombre: true, createdAt: true, updatedAt: true, _count: { select: { citasComerciales: true, obsequios: true, citasGeneradas: true } } },
    orderBy: { nombre: 'asc' },
  })
  for (const c of clientes) {
    console.log(`  ${c.nombre}  created=${c.createdAt.toISOString()}  updated=${c.updatedAt.toISOString()}  citas=${c._count.citasComerciales}  obsequios=${c._count.obsequios}  generadas=${c._count.citasGeneradas}`)
  }

  console.log('\n=== Actividad reciente: CitaComercial creadas/actualizadas hoy ===')
  const hoy0 = new Date('2026-05-18T00:00:00Z')
  const recientes = await prisma.citaComercial.findMany({
    where: { OR: [{ createdAt: { gte: hoy0 } }, { updatedAt: { gte: hoy0 } }] },
    include: { cliente: { include: { empresa: { select: { nombre: true } } } }, ejecutivo: { select: { nombre: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  console.log(`  total: ${recientes.length}`)
  for (const r of recientes) {
    console.log(`  ${r.updatedAt.toISOString()}  ${r.dia} ${r.horario}  cliente="${r.cliente.nombre}"  empresa="${r.cliente.empresa.nombre}"  ejec="${r.ejecutivo.nombre}"  created=${r.createdAt.toISOString()}`)
  }

  console.log('\n=== Empresas actualizadas hoy ===')
  const empsHoy = await prisma.empresa.findMany({
    where: { updatedAt: { gte: hoy0 } },
    select: { id: true, nombre: true, ejecutivoId: true, updatedAt: true, ejecutivo: { select: { nombre: true } }, _count: { select: { clientes: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  for (const e of empsHoy) {
    console.log(`  ${e.updatedAt.toISOString()}  "${e.nombre}" (${e.id})  ejec="${e.ejecutivo?.nombre}"  clientes=${e._count.clientes}`)
  }

  console.log('\n=== Clientes actualizados hoy ===')
  const clHoy = await prisma.cliente.findMany({
    where: { updatedAt: { gte: hoy0 } },
    select: { id: true, nombre: true, empresa: { select: { nombre: true, ejecutivoId: true, ejecutivo: { select: { nombre: true } } } }, updatedAt: true, _count: { select: { citasComerciales: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })
  for (const c of clHoy) {
    console.log(`  ${c.updatedAt.toISOString()}  "${c.nombre}"  empresa="${c.empresa.nombre}" ejec="${c.empresa.ejecutivo?.nombre}"  citas=${c._count.citasComerciales}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
