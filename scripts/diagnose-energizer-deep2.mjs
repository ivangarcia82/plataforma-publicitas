// Más diagnóstico: ¿hay citas con notas que mencionen energizer? ¿hay clientes
// duplicados con esos nombres en OTRAS empresas? ¿updatedAt de la empresa?
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== 1) Empresa Energizer (todas las columnas) ===')
  const emp = await prisma.empresa.findFirst({
    where: { nombre: { contains: 'energizer', mode: 'insensitive' } },
  })
  console.log(emp)

  console.log('\n=== 2) ¿Citas comerciales con "energizer" en notas? ===')
  const citasPorNota = await prisma.citaComercial.findMany({
    where: { notas: { contains: 'energizer', mode: 'insensitive' } },
    include: {
      cliente: { include: { empresa: { select: { nombre: true } } } },
      ejecutivo: { select: { nombre: true } },
    },
  })
  console.log(`  total: ${citasPorNota.length}`)
  for (const c of citasPorNota) console.log(`    ${c.dia} ${c.horario} cliente="${c.cliente.nombre}" empresa="${c.cliente.empresa.nombre}" ejec="${c.ejecutivo.nombre}" notas="${c.notas}"`)

  console.log('\n=== 3) Ejecutivos vinculados a Energizer (Erika) — todas sus citas recientes ===')
  if (emp) {
    const erikaCitas = await prisma.citaComercial.findMany({
      where: { ejecutivoId: emp.ejecutivoId },
      include: {
        cliente: { include: { empresa: { select: { nombre: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    console.log(`  total citas de "${emp.ejecutivoId}": ${erikaCitas.length}`)
    for (const c of erikaCitas) {
      console.log(`    ${c.dia} ${c.horario}  status=${c.status}  cliente="${c.cliente.nombre}"  empresa="${c.cliente.empresa.nombre}"  created=${c.createdAt.toISOString()}`)
    }
  }

  console.log('\n=== 4) Resumen de empresas creadas en mismo día que Energizer ===')
  if (emp) {
    const sameDay = new Date(emp.createdAt)
    sameDay.setHours(0, 0, 0, 0)
    const nextDay = new Date(sameDay); nextDay.setDate(nextDay.getDate() + 1)
    const empresasMismoDia = await prisma.empresa.findMany({
      where: { createdAt: { gte: sameDay, lt: nextDay } },
      select: { id: true, nombre: true, ejecutivoId: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    })
    for (const e of empresasMismoDia) console.log(`  ${e.createdAt.toISOString()}  ${e.nombre}  (${e.id})  updated=${e.updatedAt.toISOString()}`)
  }

  console.log('\n=== 5) Últimas 20 CitaComercial creadas globalmente ===')
  const last = await prisma.citaComercial.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      cliente: { include: { empresa: { select: { nombre: true } } } },
      ejecutivo: { select: { nombre: true } },
    },
  })
  for (const c of last) {
    console.log(`  ${c.createdAt.toISOString()}  ${c.dia} ${c.horario}  cliente="${c.cliente.nombre}"  empresa="${c.cliente.empresa.nombre}"  ejec="${c.ejecutivo.nombre}"`)
  }

  console.log('\n=== 6) Clientes con nombres "Ernesto/Brayan/Estefania/Gabriela/Daniel/Elena" en OTRA empresa ===')
  const partial = ['Ernesto', 'Brayan', 'Estefania', 'Gabriela', 'Daniel', 'Elena Vaz']
  for (const p of partial) {
    const cs = await prisma.cliente.findMany({
      where: { nombre: { contains: p, mode: 'insensitive' }, empresa: { nombre: { not: { contains: 'energizer', mode: 'insensitive' } } } },
      include: { empresa: { select: { nombre: true } }, _count: { select: { citasComerciales: true } } },
      take: 5,
    })
    if (cs.length) {
      console.log(`  match "${p}":`)
      for (const c of cs) console.log(`    "${c.nombre}" empresa="${c.empresa.nombre}" citas=${c._count.citasComerciales}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
