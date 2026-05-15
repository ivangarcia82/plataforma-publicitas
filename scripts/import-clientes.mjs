// Import clientes from "Registros VIP.xlsx" (sheet "Marketing").
//
// Pre-requisite: vendedores already loaded via import-vendedores.mjs.
//
// Rules:
// - Wipe existing empresas / clientes / citas (keep vendedores + admin users).
// - Create a "Marketing" Ejecutivo + user (marketing@generandoideas.com) to
//   absorb rows whose Ejecutivo column says "Marketing".
// - Real names in the VIP "Ejecutivo" column are fuzzy-matched against the
//   existing 35 vendedores (accent-insensitive token match w/ ≥3-char prefix).
// - "No aplica" rows are skipped entirely.
// - Empresas grouped by email domain. Assigned to the first real vendedor
//   encountered for that domain (Marketing user counts as real).
// - Domains with no real ejecutivo at all are skipped (no empresa, no cliente).
// - Clientes: every row whose domain has an empresa.
// - Citas: rows whose Ejecutivo maps to a vendedor AND día is mapped.
//   "20 de Mayo" -> Día 1, "21 de Mayo" -> Día 2, "22 de Mayo" -> Día 3,
//   "Los tres días" -> 3 citas. Other values -> no cita.

import xlsx from 'xlsx'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const norm = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

const tokens = (s) => norm(s).split(/\s+/).filter(Boolean)

function commonPrefix(a, b) {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

// Match VIP "Ejecutivo" value (e.g. "Gil Tapia") to a vendedor.nombre token list.
// All VIP tokens must find a vendedor token that shares ≥3-char common prefix
// (and length ≥3 on both sides).
function matches(vipTokens, vendTokens) {
  return vipTokens.every((vt) =>
    vendTokens.some((dt) => {
      if (vt.length < 3 || dt.length < 3) return vt === dt
      return commonPrefix(vt, dt) >= 3
    })
  )
}

function mapDia(raw) {
  const v = norm(raw)
  if (v === '20 de mayo') return ['Día 1']
  if (v === '21 de mayo') return ['Día 2']
  if (v === '22 de mayo') return ['Día 3']
  if (v === 'los tres dias') return ['Día 1', 'Día 2', 'Día 3']
  return []
}

async function main() {
  const wb = xlsx.readFile('Registros VIP.xlsx')
  const ws = wb.Sheets['Marketing']
  if (!ws) throw new Error('Sheet "Marketing" not found')
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '', raw: false })

  console.log('Wiping empresas / clientes / citas...')
  await prisma.citaComercial.deleteMany({})
  await prisma.obsequio.deleteMany({})
  await prisma.citaGenerada.deleteMany({})
  await prisma.cliente.deleteMany({})
  await prisma.empresa.deleteMany({})
  console.log('  done.')

  // --- Ensure "Marketing" ejecutivo exists ---
  const marketingEmail = 'marketing@generandoideas.com'
  let marketingEj = await prisma.ejecutivo.findFirst({ where: { email: marketingEmail } })
  if (!marketingEj) {
    marketingEj = await prisma.ejecutivo.create({
      data: { nombre: 'Marketing', email: marketingEmail, telefono: '', cargo: 'Marketing', activo: true },
    })
    const passwordHash = await bcrypt.hash('publicitas2026', 10)
    const existingUser = await prisma.user.findUnique({ where: { email: marketingEmail } })
    if (existingUser) {
      await prisma.user.update({
        where: { email: marketingEmail },
        data: { passwordHash, rol: 'ejecutivo', ejecutivoId: marketingEj.id, nombre: 'Marketing' },
      })
    } else {
      await prisma.user.create({
        data: { email: marketingEmail, passwordHash, nombre: 'Marketing', rol: 'ejecutivo', ejecutivoId: marketingEj.id },
      })
    }
    console.log(`Created Marketing ejecutivo + user (${marketingEmail} / publicitas2026)`)
  } else {
    console.log(`Marketing ejecutivo already exists (${marketingEmail})`)
  }

  // --- Load all vendedores from DB for matching ---
  const vendedores = await prisma.ejecutivo.findMany()
  const vendByTokens = vendedores.map((v) => ({ id: v.id, nombre: v.nombre, toks: tokens(v.nombre) }))

  // --- Build VIP-name -> vendedor.id map ---
  const vipNameToEjId = new Map()
  const unmatched = new Set()
  const ambiguous = []

  const uniqueVipNames = new Set()
  for (const r of rows) {
    const v = (r['Ejecutivo'] || '').trim()
    if (v) uniqueVipNames.add(v)
  }

  for (const vipName of uniqueVipNames) {
    const lower = norm(vipName)
    if (lower === 'no aplica') continue
    if (lower === 'marketing') {
      vipNameToEjId.set(vipName, marketingEj.id)
      continue
    }
    const vt = tokens(vipName)
    const hits = vendByTokens.filter((v) => matches(vt, v.toks))
    if (hits.length === 1) {
      vipNameToEjId.set(vipName, hits[0].id)
    } else if (hits.length > 1) {
      ambiguous.push({ vipName, hits: hits.map((h) => h.nombre) })
    } else {
      unmatched.add(vipName)
    }
  }

  if (ambiguous.length) {
    console.log('\nAMBIGUOUS matches (skipped):')
    for (const a of ambiguous) console.log(`  "${a.vipName}" -> [${a.hits.join(', ')}]`)
  }
  if (unmatched.size) {
    console.log('\nUNMATCHED VIP ejecutivo values (skipped):')
    for (const u of unmatched) console.log(`  ${u}`)
  }

  console.log('\nMappings:')
  for (const [vip, id] of vipNameToEjId.entries()) {
    const v = vendedores.find((x) => x.id === id)
    console.log(`  ${vip.padEnd(28)} -> ${v.nombre} <${v.email}>`)
  }

  // --- Pass 1: collect domains and assign ejecutivo ---
  const domains = new Map() // domain -> { company, ejecutivoId }
  for (const r of rows) {
    const email = (r['Email'] || '').toString().trim().toLowerCase()
    if (!email.includes('@')) continue
    const domain = email.split('@')[1]
    const vipName = (r['Ejecutivo'] || '').trim()
    const ejId = vipName ? vipNameToEjId.get(vipName) : null

    if (!domains.has(domain)) {
      domains.set(domain, { company: (r['Company'] || '').trim() || domain, ejecutivoId: ejId || null })
    } else {
      const d = domains.get(domain)
      if (!d.ejecutivoId && ejId) d.ejecutivoId = ejId
      if (!d.company && r['Company']) d.company = r['Company'].trim()
    }
  }

  const validDomains = new Map()
  for (const [dom, info] of domains.entries()) if (info.ejecutivoId) validDomains.set(dom, info)
  console.log(`\nDomains: ${domains.size} total, ${validDomains.size} with ejecutivo (others skipped).`)

  // --- Create empresas ---
  console.log(`Creating ${validDomains.size} empresas...`)
  const empresaIdByDomain = new Map()
  for (const [dom, info] of validDomains.entries()) {
    const created = await prisma.empresa.create({
      data: { nombre: info.company || dom, ciudadEstado: '', notas: `Dominio: ${dom}`, ejecutivoId: info.ejecutivoId },
    })
    empresaIdByDomain.set(dom, created.id)
  }

  // --- Create clientes + citas ---
  console.log('Creating clientes and citas...')
  let clientesCount = 0
  let citasCount = 0
  let skippedNoDomain = 0
  for (const r of rows) {
    const email = (r['Email'] || '').toString().trim().toLowerCase()
    if (!email.includes('@')) { skippedNoDomain++; continue }
    const domain = email.split('@')[1]
    const empresaId = empresaIdByDomain.get(domain)
    if (!empresaId) { skippedNoDomain++; continue }

    const firstName = (r['First name'] || '').toString().trim()
    const lastName = (r['Last name'] || '').toString().trim()
    const nombre = `${firstName} ${lastName}`.trim() || email
    const cargo = (r['Cargo / área'] || '').toString().trim()
    const telefono = (r['Phone number'] || '').toString().replace(/^'/, '').trim()

    const cliente = await prisma.cliente.create({
      data: { nombre, cargo, email, telefono, notas: '', empresaId },
    })
    clientesCount++

    const vipName = (r['Ejecutivo'] || '').trim()
    const ejId = vipName ? vipNameToEjId.get(vipName) : null
    if (!ejId) continue
    const dias = mapDia(r['¿Qué día te gustaría asistir a Expo Publicitas?'])
    for (const dia of dias) {
      await prisma.citaComercial.create({
        data: { ejecutivoId: ejId, clienteId: cliente.id, dia, status: 'Tentativa', horario: '', transporte: '', notas: '' },
      })
      citasCount++
    }
  }

  console.log(`\n=== Import summary ===`)
  console.log(`Empresas: ${empresaIdByDomain.size}`)
  console.log(`Clientes: ${clientesCount}`)
  console.log(`Citas: ${citasCount}`)
  console.log(`Rows skipped (no domain or domain without ejecutivo): ${skippedNoDomain}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
