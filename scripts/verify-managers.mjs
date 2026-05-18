// Verifica la visibilidad nueva de cada manager calculando lo mismo
// que harían las queries del API.
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function summary(email) {
  const u = await prisma.user.findUnique({
    where: { email },
    include: { ejecutivo: { select: { id: true, nombre: true } } },
  })
  if (!u) { console.log(`  user ${email} NO encontrado`); return }
  const accessible = u.ejecutivoId ? [u.ejecutivoId, ...u.managedEjecutivoIds] : []
  const [empresas, citas, clientes, obsequios] = await Promise.all([
    prisma.empresa.count({ where: { ejecutivoId: { in: accessible } } }),
    prisma.citaComercial.count({ where: { ejecutivoId: { in: accessible } } }),
    prisma.cliente.count({ where: { empresa: { ejecutivoId: { in: accessible } } } }),
    prisma.obsequio.count({ where: { ejecutivoId: { in: accessible } } }),
  ])
  console.log(`\n${u.nombre} <${u.email}>`)
  console.log(`  ejecutivos accesibles: ${accessible.length} (1 propio + ${u.managedEjecutivoIds.length} a cargo)`)
  console.log(`  empresas visibles: ${empresas}`)
  console.log(`  clientes visibles: ${clientes}`)
  console.log(`  citas comerciales visibles: ${citas}`)
  console.log(`  obsequios visibles: ${obsequios}`)
}

await summary('jrios@generandoideas.com')
await summary('gquinones@generandoideas.com')
await summary('aquiroz@generandoideas.com')

// Control: un ejecutivo normal sin permisos extra
await summary('nsanchez@generandoideas.com')

await prisma.$disconnect()
