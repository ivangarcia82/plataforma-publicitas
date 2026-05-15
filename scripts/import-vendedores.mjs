// Import vendedores (Ejecutivos) from "GIM.Contactos Vendedores.xlsx".
//
// Rules:
// - Drop all transactional data first (ejecutivos, empresas, clientes, citas,
//   obsequios, citas generadas, rifa, reviews) and ejecutivo users.
// - Keep admin users, MaterialDigital, InventarioObsequio, StaffMember.
// - For each row: create Ejecutivo + User account.
// - Password convention: "<emailUser>2026!"  (e.g. agamboa@... -> agamboa2026!)
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

  const seen = new Set()
  let created = 0
  let skipped = 0
  const creds = []

  for (const r of rows) {
    const email = (r['Email profesional'] || '').toString().trim().toLowerCase()
    const nombre = (r['Nombre completo'] || '').toString().trim()
    const departamento = (r['Departamento'] || '').toString().trim()
    const cargoRaw = (r['Cargo'] || '').toString().trim().replace(/\s+/g, ' ')

    if (!email || !email.includes('@') || !nombre) { skipped++; continue }
    if (seen.has(email)) { skipped++; continue }
    seen.add(email)

    const emailUser = email.split('@')[0]
    const cargo = departamento ? `${cargoRaw} · ${departamento}` : cargoRaw

    const ej = await prisma.ejecutivo.create({
      data: { nombre, email, telefono: '', cargo, activo: true },
    })

    const password = `${emailUser}2026!`
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        nombre,
        rol: 'ejecutivo',
        ejecutivoId: ej.id,
      },
    })

    created++
    creds.push({ nombre, email, password })
  }

  console.log(`=== Import summary ===`)
  console.log(`Vendedores creados: ${created}`)
  console.log(`Filas omitidas: ${skipped}\n`)

  console.log(`=== Credenciales (CAMBIAR DESPUÉS) ===`)
  creds.sort((a, b) => a.nombre.localeCompare(b.nombre))
  for (const c of creds) {
    console.log(`  ${c.email.padEnd(40)}  →  ${c.password}`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
