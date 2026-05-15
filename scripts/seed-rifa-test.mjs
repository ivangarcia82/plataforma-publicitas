// Seed N test participants into a single test día for ruleta preview.
// Usage: node scripts/seed-rifa-test.mjs [count] [diaLabel]
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COUNT = Number(process.argv[2]) || 300
const DIA = process.argv[3] || 'Día PRUEBA'

const NOMBRES_PILA = [
  'Sofía', 'Diego', 'Valentina', 'Andrés', 'Camila', 'Mateo', 'Lucía', 'Sebastián',
  'Isabella', 'Daniel', 'Mariana', 'Emilio', 'Renata', 'Adrián', 'Paula', 'Joaquín',
  'Regina', 'Iván', 'Fernanda', 'Leonardo', 'Ximena', 'Tomás', 'Daniela', 'Maximiliano',
  'Andrea', 'Rodrigo', 'Natalia', 'Pablo', 'Carolina', 'Eduardo', 'Alejandra', 'Bruno',
  'Constanza', 'Damián', 'Elena', 'Federico', 'Gabriela', 'Héctor', 'Inés', 'Javier',
  'Karla', 'Luis', 'Mónica', 'Nicolás', 'Olivia', 'Patricio', 'Quetzal', 'Raúl',
  'Silvia', 'Tadeo', 'Úrsula', 'Víctor', 'Wendy', 'Ximeno', 'Yolanda', 'Zacarías',
]

const APELLIDOS = [
  'Martínez', 'Ramírez', 'Torres', 'López', 'Hernández', 'González', 'Pérez', 'Rodríguez',
  'Sánchez', 'Flores', 'Castro', 'Vargas', 'Jiménez', 'Morales', 'Reyes', 'Núñez',
  'Mendoza', 'Cruz', 'Aguilar', 'Ortega', 'Ruiz', 'Romero', 'Silva', 'Vega',
  'Cordero', 'Guerrero', 'Espinoza', 'Salinas', 'Pacheco', 'Cervantes', 'Ávila', 'Beltrán',
]

const EMPRESAS = [
  'Cementos Atlas', 'Grupo Helvex', 'Tequila Don Julio', 'Bimbo', 'Aeroméxico', 'Telcel',
  'Liverpool', 'Cinépolis', 'Walmart México', 'OXXO', 'Soriana', 'Coca-Cola FEMSA',
  'Modelo', 'Banamex', 'BBVA', 'Santander', 'Banorte', 'Cemex', 'Grupo Bimbo', 'Lala',
  'Alpura', 'Sigma', 'Maseca', 'Herdez', 'Jumex', 'Bachoco', 'Pilgrim\'s', 'Nestlé México',
  'PepsiCo México', 'Unilever', 'Procter & Gamble', 'Kimberly-Clark', 'Colgate', 'L\'Oréal',
  'Mabe', 'Whirlpool', 'Bosch México', 'Siemens', 'GE México', 'Schneider Electric',
]

const CARGOS = [
  'Director Marketing', 'Gerente Comercial', 'CEO', 'Subdirector', 'Jefe de Compras',
  'Coordinador', 'Director General', 'Gerente de Operaciones', 'VP Ventas',
  'Director Comercial', 'Gerente de Producto', 'Jefe de Ventas', 'Director de TI',
  'Gerente de Marketing', 'Coordinador Regional', 'Director Financiero',
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function main() {
  const ejecutivos = await prisma.ejecutivo.findMany({ select: { id: true } })
  if (ejecutivos.length === 0) {
    console.error('No hay ejecutivos en la BD. Corre antes el import VIP.')
    process.exit(1)
  }

  // Next ticket for this día (in case there are previous test records)
  const last = await prisma.participanteRifa.findFirst({
    where: { diaRifa: DIA },
    orderBy: { numeroTicket: 'desc' },
    select: { numeroTicket: true },
  })
  let nextTicket = (last?.numeroTicket || 0) + 1

  console.log(`Sembrando ${COUNT} participantes en "${DIA}"...`)

  const data = []
  for (let i = 0; i < COUNT; i++) {
    const nombre = `${pick(NOMBRES_PILA)} ${pick(APELLIDOS)}`
    const empresa = pick(EMPRESAS)
    const cargo = pick(CARGOS)
    const ej = pick(ejecutivos)
    const emailUser = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    const numeroTicket = nextTicket++

    data.push({
      nombre,
      empresa,
      cargo,
      email: `${emailUser}+${DIA.replace(/\s+/g, '')}_${numeroTicket}@demo.com`,
      telefono: `+52 55 ${Math.floor(10000000 + Math.random() * 89999999)}`,
      diaRifa: DIA,
      numeroTicket,
      ejecutivoId: ej.id,
      rating: 4 + Math.floor(Math.random() * 2),
      comentario: '',
    })
  }

  // Batch insert
  const result = await prisma.participanteRifa.createMany({ data, skipDuplicates: true })
  console.log(`✓ Creados ${result.count} participantes en "${DIA}"`)

  const total = await prisma.participanteRifa.count({ where: { diaRifa: DIA } })
  console.log(`  Total en "${DIA}": ${total}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
