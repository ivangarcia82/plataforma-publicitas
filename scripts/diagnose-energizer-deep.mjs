// Diagnóstico profundo: busca CitaComercial relacionadas con Energizer aunque
// estén en clientes/empresas duplicadas. También revisa CitaGenerada (texto libre).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const NAMES = ['Ernesto Gonzalez', 'Brayan Alvarez', 'Estefania Mujica', 'Gabriela Garcia-Jurado', 'Daniel Guillen', 'Elena Vazquez']

  console.log('\n=== 1) Empresas que contengan "energizer" ===')
  const empresas = await prisma.empresa.findMany({
    where: { nombre: { contains: 'energizer', mode: 'insensitive' } },
    select: { id: true, nombre: true, ejecutivoId: true, createdAt: true },
  })
  console.log(empresas)

  console.log('\n=== 2) TODOS los clientes con esos nombres (en cualquier empresa) ===')
  const clientes = await prisma.cliente.findMany({
    where: { OR: NAMES.map(n => ({ nombre: { equals: n, mode: 'insensitive' } })) },
    include: { empresa: { select: { id: true, nombre: true, ejecutivoId: true } } },
    orderBy: { nombre: 'asc' },
  })
  for (const c of clientes) {
    console.log(`  ${c.nombre}  cliente=${c.id}  empresa="${c.empresa.nombre}" (${c.empresaId})`)
  }

  console.log('\n=== 3) CitaComercial para CUALQUIER cliente con esos nombres ===')
  const clienteIds = clientes.map(c => c.id)
  const citas = await prisma.citaComercial.findMany({
    where: { clienteId: { in: clienteIds } },
    include: {
      cliente: { include: { empresa: { select: { nombre: true, id: true } } } },
      ejecutivo: { select: { nombre: true, activo: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  console.log(`  total citas: ${citas.length}`)
  for (const ct of citas) {
    console.log(
      `    ${ct.dia} ${ct.horario}  status=${ct.status}  ` +
      `cliente="${ct.cliente.nombre}" (${ct.clienteId})  ` +
      `empresa="${ct.cliente.empresa.nombre}"  ` +
      `ejecutivo="${ct.ejecutivo.nombre}"  created=${ct.createdAt.toISOString()}`
    )
  }

  console.log('\n=== 4) CitaGenerada que mencione "energizer" en texto libre ===')
  const generadas = await prisma.citaGenerada.findMany({
    where: {
      OR: [
        { empresaTexto: { contains: 'energizer', mode: 'insensitive' } },
        { contactoTexto: { contains: 'energizer', mode: 'insensitive' } },
        { notas: { contains: 'energizer', mode: 'insensitive' } },
      ],
    },
    select: { id: true, fecha: true, empresaTexto: true, contactoTexto: true, accion: true, ejecutivoTexto: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  console.log(`  total citas generadas: ${generadas.length}`)
  for (const g of generadas) {
    console.log(`    ${g.fecha}  empresa="${g.empresaTexto}"  contacto="${g.contactoTexto}"  ejec="${g.ejecutivoTexto}"  accion=${g.accion}  (${g.id})`)
  }

  console.log('\n=== 5) Totales globales de CitaComercial ===')
  const total = await prisma.citaComercial.count()
  console.log(`  total CitaComercial en BD: ${total}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
