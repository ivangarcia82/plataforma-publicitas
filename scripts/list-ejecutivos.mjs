import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const ejs = await prisma.ejecutivo.findMany({
  include: { user: { select: { email: true } }, _count: { select: { empresas: true } } },
  orderBy: { nombre: 'asc' },
})
for (const e of ejs) {
  console.log(`  ${e.id}  ${e.nombre.padEnd(45)}  cargo="${e.cargo}"  email=${e.user?.email ?? '—'}  empresas=${e._count.empresas}  activo=${e.activo}`)
}
console.log(`\nTotal: ${ejs.length}`)

await prisma.$disconnect()
