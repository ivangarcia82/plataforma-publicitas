// Seed test participants across Día 1, Día 2, Día 3 for ruleta demo.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NOMBRES = [
  'Sofía Martínez', 'Diego Ramírez', 'Valentina Torres', 'Andrés López',
  'Camila Hernández', 'Mateo González', 'Lucía Pérez', 'Sebastián Rodríguez',
  'Isabella Sánchez', 'Daniel Flores', 'Mariana Castro', 'Emilio Vargas',
  'Renata Jiménez', 'Adrián Morales', 'Paula Reyes', 'Joaquín Núñez',
  'Regina Mendoza', 'Iván Cruz', 'Fernanda Aguilar', 'Leonardo Ortega',
  'Ximena Ruiz', 'Tomás Romero', 'Daniela Silva', 'Maximiliano Vega',
  'Andrea Cordero', 'Rodrigo Guerrero', 'Natalia Espinoza', 'Pablo Salinas',
  'Carolina Pacheco', 'Eduardo Cervantes',
]

const EMPRESAS = [
  'Cementos Atlas', 'Grupo Helvex', 'Tequila Don Julio', 'Bimbo',
  'Aeroméxico', 'Telcel', 'Liverpool', 'Cinépolis', 'Walmart México',
  'OXXO', 'Soriana', 'Coca-Cola FEMSA', 'Modelo', 'Banamex', 'BBVA',
]

const CARGOS = ['Director Marketing', 'Gerente Comercial', 'CEO', 'Subdirector', 'Jefe de Compras', 'Coordinador']

const DIAS = ['Día 1', 'Día 2', 'Día 3']

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function main() {
  const ejecutivos = await prisma.ejecutivo.findMany({ select: { id: true } })
  if (ejecutivos.length === 0) {
    console.error('No hay ejecutivos. Corre antes el import VIP.')
    process.exit(1)
  }

  // Determine next numeroTicket per día (in case there are existing records)
  const nextTicketByDia = new Map()
  for (const dia of DIAS) {
    const last = await prisma.participanteRifa.findFirst({
      where: { diaRifa: dia },
      orderBy: { numeroTicket: 'desc' },
      select: { numeroTicket: true },
    })
    nextTicketByDia.set(dia, (last?.numeroTicket || 0) + 1)
  }

  // 10 participants per día = 30 total
  const PER_DIA = 10
  let total = 0

  for (const dia of DIAS) {
    for (let i = 0; i < PER_DIA; i++) {
      const nombre = pick(NOMBRES)
      const empresa = pick(EMPRESAS)
      const cargo = pick(CARGOS)
      const ej = pick(ejecutivos)
      const emailUser = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
      const numeroTicket = nextTicketByDia.get(dia)
      nextTicketByDia.set(dia, numeroTicket + 1)

      await prisma.participanteRifa.create({
        data: {
          nombre,
          empresa,
          cargo,
          email: `${emailUser}+${dia.replace(' ', '')}_${numeroTicket}@demo.com`,
          telefono: `+52 55 ${Math.floor(10000000 + Math.random() * 89999999)}`,
          diaRifa: dia,
          numeroTicket,
          ejecutivoId: ej.id,
          rating: 4 + Math.floor(Math.random() * 2),
          comentario: '',
        },
      })
      total++
    }
  }

  console.log(`Created ${total} test participants (${PER_DIA} per día across ${DIAS.length} días)`)

  // Summary
  for (const dia of DIAS) {
    const count = await prisma.participanteRifa.count({ where: { diaRifa: dia } })
    console.log(`  ${dia}: ${count} participantes`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
