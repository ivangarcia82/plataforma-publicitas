// Reset the password of every user with rol="ejecutivo" to "publicitas2026".
// Admin users are NOT touched.
//
// Usage:
//   node scripts/reset-ejecutivo-passwords.mjs                  # uses DATABASE_URL from .env
//   DATABASE_URL="<prod-url>" node scripts/reset-ejecutivo-passwords.mjs

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const NEW_PASSWORD = 'publicitas2026'
const prisma = new PrismaClient()

try {
  const hash = await bcrypt.hash(NEW_PASSWORD, 10)
  const result = await prisma.user.updateMany({
    where: { rol: 'ejecutivo' },
    data: { passwordHash: hash },
  })
  console.log(`Updated ${result.count} ejecutivo users — password: "${NEW_PASSWORD}"`)
} finally {
  await prisma.$disconnect()
}
