// app/api/analytics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, authErrorResponse } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireUser()
    const ejecutivoFilter = user.rol === 'ejecutivo' ? { ejecutivoId: user.ejecutivoId! } : {}

    const [citas, staff, obsequios, generadas] = await Promise.all([
      prisma.citaComercial.findMany({
        where: ejecutivoFilter,
        include: {
          ejecutivo: { select: { nombre: true } },
          cliente: { select: { empresa: { select: { nombre: true } } } },
        },
      }),
      prisma.staffMember.findMany(),
      prisma.obsequio.findMany({
        where: ejecutivoFilter,
        include: { ejecutivo: { select: { nombre: true } } },
      }),
      prisma.citaGenerada.findMany({
        where: ejecutivoFilter,
        include: { ejecutivo: { select: { nombre: true } } },
      }),
    ])

  const citasPorDia: Record<string, number> = {}
  citas.forEach(c => { citasPorDia[c.dia] = (citasPorDia[c.dia] || 0) + 1 })

  const citasPorStatus: Record<string, number> = {}
  citas.forEach(c => { citasPorStatus[c.status] = (citasPorStatus[c.status] || 0) + 1 })

  // Citas por ejecutivo (ahora deduplicado por ID, mostrando nombre)
  const citasPorEjecutivo: Record<string, number> = {}
  citas.forEach(c => {
    const nombre = c.ejecutivo.nombre
    citasPorEjecutivo[nombre] = (citasPorEjecutivo[nombre] || 0) + 1
  })

  // Citas por empresa (nuevo: aprovecha la relación)
  const citasPorEmpresa: Record<string, number> = {}
  citas.forEach(c => {
    const nombre = c.cliente.empresa.nombre
    citasPorEmpresa[nombre] = (citasPorEmpresa[nombre] || 0) + 1
  })

  const staffPorRol: Record<string, number> = {}
  staff.forEach(s => { staffPorRol[s.rol] = (staffPorRol[s.rol] || 0) + 1 })

  const viaticoTotal = staff.reduce((sum, s) => sum + s.viaticoCantidad, 0)
  const viaticoPendiente = staff.filter(s => s.viaticoStatus === 'Pendiente').reduce((sum, s) => sum + s.viaticoCantidad, 0)
  const viaticoEntregado = viaticoTotal - viaticoPendiente

  const obsequiosPorTipo: Record<string, number> = {}
  obsequios.forEach(o => { obsequiosPorTipo[o.tipoCliente] = (obsequiosPorTipo[o.tipoCliente] || 0) + 1 })

  const generadasPorAccion: Record<string, number> = {}
  generadas.forEach(g => { generadasPorAccion[g.accion] = (generadasPorAccion[g.accion] || 0) + 1 })

    return NextResponse.json({
      totales: {
        citas: citas.length,
        staff: staff.length,
        obsequios: obsequios.length,
        generadas: generadas.length,
      },
      citasPorDia,
      citasPorStatus,
      citasPorEjecutivo,
      citasPorEmpresa,
      staffPorRol,
      viaticos: { total: viaticoTotal, pendiente: viaticoPendiente, entregado: viaticoEntregado },
      obsequiosPorTipo,
      generadasPorAccion,
    })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
