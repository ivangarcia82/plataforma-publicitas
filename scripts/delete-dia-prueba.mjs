import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const DIA = process.argv[2] || 'Día PRUEBA'
const r = await prisma.participanteRifa.deleteMany({ where: { diaRifa: DIA } })
console.log(`Borrados ${r.count} participantes de "${DIA}"`)
await prisma.$disconnect()
