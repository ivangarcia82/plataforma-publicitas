// Usage:
//   node scripts/create-user.mjs admin <email> <password>
//   node scripts/create-user.mjs ejecutivo <email> <password> <ejecutivoId>
//
// Examples:
//   node scripts/create-user.mjs admin admin@expo.com SuperSecret123
//   node scripts/create-user.mjs ejecutivo mquintanilla@gen.com Temp123 cmp3ozkzy0000v3ffvhbzndlg
//
// To list available ejecutivoIds:
//   docker exec expo_publicitas_db psql -U publicitas -d expo_publicitas -c 'SELECT id, nombre FROM "Ejecutivo";'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const [, , rol, email, password, ejecutivoId] = process.argv

if (!rol || !email || !password) {
  console.error('Usage: node scripts/create-user.mjs <admin|ejecutivo> <email> <password> [ejecutivoId]')
  process.exit(1)
}

if (rol === 'ejecutivo' && !ejecutivoId) {
  console.error('Rol "ejecutivo" requires ejecutivoId as 4th argument')
  process.exit(1)
}

const prisma = new PrismaClient()

try {
  const passwordHash = await bcrypt.hash(password, 10)
  let nombre = email.split('@')[0]
  if (rol === 'ejecutivo') {
    const ej = await prisma.ejecutivo.findUnique({ where: { id: ejecutivoId } })
    if (!ej) {
      console.error(`Ejecutivo with id ${ejecutivoId} not found`)
      process.exit(1)
    }
    nombre = ej.nombre
  }
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, rol, ejecutivoId: rol === 'ejecutivo' ? ejecutivoId : null, nombre },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      nombre,
      rol,
      ejecutivoId: rol === 'ejecutivo' ? ejecutivoId : null,
    },
  })
  console.log(`User created/updated:`, { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol, ejecutivoId: user.ejecutivoId })
} catch (e) {
  console.error('Error:', e.message)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
