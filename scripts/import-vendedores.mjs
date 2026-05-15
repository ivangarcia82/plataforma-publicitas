// Import vendedores (Ejecutivos) from "GIM.Contactos Vendedores.xlsx".
//
// Rules:
// - Drop all transactional data first (ejecutivos, empresas, clientes, citas,
//   obsequios, citas generadas, rifa, reviews) and ejecutivo users.
// - Keep admin users, MaterialDigital, InventarioObsequio, StaffMember.
// - For each row: create Ejecutivo + User account.
// - Password convention: shared default "publicitas2026" for all ejecutivos.
// - cargo field stores: "<Cargo> · <Departamento>"  (preserves both pieces)

import xlsx from 'xlsx'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const wb = xlsx.readFile('GIM.Contactos Vendedores.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '', raw: false })

  console.log('Wiping transactional data...')
  await prisma.citaComercial.deleteMany({})
  await prisma.obsequio.deleteMany({})
  await prisma.citaGenerada.deleteMany({})
  await prisma.participanteRifa.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.cliente.deleteMany({})
  await prisma.empresa.deleteMany({})
  await prisma.user.deleteMany({ where: { rol: 'ejecutivo' } })
  await prisma.ejecutivo.deleteMany({})
  console.log('  done.\n')

  const DEFAULT_PASSWORD = 'publicitas2026'
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  const seen = new Set()
  let created = 0
  let skipped = 0

  for (const r of rows) {
    const email = (r['Email profesional'] || '').toString().trim().toLowerCase()
    const nombre = (r['Nombre completo'] || '').toString().trim()
    const departamento = (r['Departamento'] || '').toString().trim()
    const cargoRaw = (r['Cargo'] || '').toString().trim().replace(/\s+/g, ' ')

    if (!email || !email.includes('@') || !nombre) { skipped++; continue }
    if (seen.has(email)) { skipped++; continue }
    seen.add(email)

    const cargo = departamento ? `${cargoRaw} · ${departamento}` : cargoRaw

    const ej = await prisma.ejecutivo.create({
      data: { nombre, email, telefono: '', cargo, activo: true },
    })

    await prisma.user.create({
      data: { email, passwordHash, nombre, rol: 'ejecutivo', ejecutivoId: ej.id },
    })

    created++
  }

  console.log(`=== Import summary ===`)
  console.log(`Vendedores creados: ${created}`)
  console.log(`Filas omitidas: ${skipped}`)
  console.log(`Contraseña (todos): ${DEFAULT_PASSWORD}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
