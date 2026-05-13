// Import VIP registrations from "Registros VIP.xlsx" (MKT sheet)
// Wipes existing transactional data first.
//
// Rules per user:
// - Drop existing ejecutivos / empresas / clientes / citas
// - Ejecutivos: column G "Ejecutivo" (unique values)
// - Ejecutivo email = first letter of first name (lowercase) + lastname (lowercase, no spaces) + @generandoideas.com
//   Example: "Noe Sanchez" -> "nsanchez@generandoideas.com"
// - Empresas: dedupe by email DOMAIN (column E). Pick first company name encountered for that domain.
// - Empresa.ejecutivo = ejecutivo of the first row of that domain that has an ejecutivo
// - Skip empresas (entire domain) where no row in that domain has any ejecutivo
// - Clientes: every VIP row whose domain has an ejecutivo
// - Citas: for each cliente row where Ejecutivo is set AND día is mapped:
//   "20 de Mayo" -> "Día 1"
//   "21 de Mayo" -> "Día 2"
//   "22 de Mayo" -> "Día 3"
//   "Los tres días" -> create 3 citas (Día 1, 2, 3)
//   other -> skip cita (still create cliente)
// - horario: empty string (omitted)
// - status: "Tentativa"
// - Users for ejecutivos: same email, password = "{emailUser}2026!" (e.g., nsanchez2026!)

import xlsx from 'xlsx'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalize(s) {
  return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function ejecutivoToEmailUser(fullName) {
  const parts = normalize(fullName).split(/\s+/).filter(Boolean)
  if (parts.length < 2) return null
  const first = parts[0]
  const last = parts.slice(1).join('')
  return (first[0] + last).toLowerCase().replace(/[^a-z0-9]/g, '')
}

function mapDia(raw) {
  const v = (raw || '').toLowerCase().trim()
  if (v === '20 de mayo') return ['Día 1']
  if (v === '21 de mayo') return ['Día 2']
  if (v === '22 de mayo') return ['Día 3']
  if (v === 'los tres días' || v === 'los tres dias') return ['Día 1', 'Día 2', 'Día 3']
  return []
}

async function main() {
  const wb = xlsx.readFile('Registros VIP.xlsx')
  const ws = wb.Sheets['MKT']
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '', raw: false })

  // --- Wipe existing transactional data (keep admin User, Materiales, Reviews, Staff, Inventario) ---
  console.log('Wiping existing data...')
  await prisma.citaComercial.deleteMany({})
  await prisma.obsequio.deleteMany({})
  await prisma.citaGenerada.deleteMany({})
  await prisma.cliente.deleteMany({})
  await prisma.empresa.deleteMany({})
  // Delete ejecutivo users (keep admin)
  await prisma.user.deleteMany({ where: { rol: 'ejecutivo' } })
  await prisma.ejecutivo.deleteMany({})
  console.log('  done.')

  // --- Pass 1: collect unique ejecutivos + domain -> empresa info ---
  const ejecutivos = new Map() // name -> { nombre, emailUser, email }
  const domains = new Map()    // domain -> { company, ejecutivoName }

  for (const r of rows) {
    const ejName = (r['Ejecutivo'] || '').trim()
    if (ejName && !ejecutivos.has(ejName)) {
      const emailUser = ejecutivoToEmailUser(ejName)
      if (emailUser) {
        ejecutivos.set(ejName, {
          nombre: ejName,
          emailUser,
          email: `${emailUser}@generandoideas.com`,
        })
      }
    }
    const email = (r['Email'] || '').trim().toLowerCase()
    if (!email.includes('@')) continue
    const domain = email.split('@')[1]
    if (!domains.has(domain)) {
      domains.set(domain, { company: (r['Company'] || '').trim() || domain, ejecutivoName: ejName || null })
    } else {
      const d = domains.get(domain)
      if (!d.ejecutivoName && ejName) d.ejecutivoName = ejName
      if (!d.company && r['Company']) d.company = r['Company'].trim()
    }
  }

  // Filter out domains without ejecutivo
  const validDomains = new Map()
  for (const [dom, info] of domains.entries()) {
    if (info.ejecutivoName) validDomains.set(dom, info)
  }
  console.log(`Domains: ${domains.size} total, ${validDomains.size} with ejecutivo (others skipped)`)

  // --- Create ejecutivos ---
  console.log(`Creating ${ejecutivos.size} ejecutivos...`)
  const ejecutivoIdByName = new Map()
  for (const e of ejecutivos.values()) {
    const created = await prisma.ejecutivo.create({
      data: {
        nombre: e.nombre,
        email: e.email,
        telefono: '',
        cargo: '',
        activo: true,
      },
    })
    ejecutivoIdByName.set(e.nombre, created.id)
  }

  // --- Create users for ejecutivos ---
  console.log(`Creating user accounts for ejecutivos...`)
  for (const e of ejecutivos.values()) {
    const password = `${e.emailUser}2026!`
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email: e.email,
        passwordHash,
        nombre: e.nombre,
        rol: 'ejecutivo',
        ejecutivoId: ejecutivoIdByName.get(e.nombre),
      },
    })
  }

  // --- Create empresas ---
  console.log(`Creating ${validDomains.size} empresas...`)
  const empresaIdByDomain = new Map()
  for (const [dom, info] of validDomains.entries()) {
    const ejId = ejecutivoIdByName.get(info.ejecutivoName)
    if (!ejId) continue
    const created = await prisma.empresa.create({
      data: {
        nombre: info.company || dom,
        ciudadEstado: '',
        notas: `Dominio: ${dom}`,
        ejecutivoId: ejId,
      },
    })
    empresaIdByDomain.set(dom, created.id)
  }

  // --- Create clientes + citas in one pass ---
  console.log('Creating clientes and citas...')
  let clientesCount = 0
  let citasCount = 0
  let skippedNoDomain = 0
  for (const r of rows) {
    const email = (r['Email'] || '').trim().toLowerCase()
    if (!email.includes('@')) { skippedNoDomain++; continue }
    const domain = email.split('@')[1]
    const empresaId = empresaIdByDomain.get(domain)
    if (!empresaId) { skippedNoDomain++; continue }

    const firstName = (r['First name'] || '').trim()
    const lastName = (r['Last name'] || '').trim()
    const nombre = `${firstName} ${lastName}`.trim() || email
    const cargo = (r['Cargo / área'] || '').trim()
    const telefono = (r['Phone number'] || '').replace(/^'/, '').trim()

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        cargo,
        email,
        telefono,
        notas: '',
        empresaId,
      },
    })
    clientesCount++

    // Citas
    const ejName = (r['Ejecutivo'] || '').trim()
    if (!ejName) continue
    const ejId = ejecutivoIdByName.get(ejName)
    if (!ejId) continue
    const diasRaw = r['¿Qué día te gustaría asistir a Expo Publicitas?']
    const dias = mapDia(diasRaw)
    for (const dia of dias) {
      await prisma.citaComercial.create({
        data: {
          ejecutivoId: ejId,
          clienteId: cliente.id,
          dia,
          status: 'Tentativa',
          horario: '',
          transporte: '',
          notas: '',
        },
      })
      citasCount++
    }
  }

  console.log(`\n=== Import summary ===`)
  console.log(`Ejecutivos: ${ejecutivos.size}`)
  console.log(`Empresas: ${empresaIdByDomain.size}`)
  console.log(`Clientes created: ${clientesCount}`)
  console.log(`Citas created: ${citasCount}`)
  console.log(`Rows skipped (no valid domain or domain without ejecutivo): ${skippedNoDomain}`)

  console.log(`\n=== Ejecutivo login credentials (CHANGE LATER) ===`)
  for (const e of [...ejecutivos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))) {
    console.log(`  ${e.email.padEnd(38)}  →  ${e.emailUser}2026!`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
