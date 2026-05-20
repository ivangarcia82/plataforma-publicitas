// Admin endpoint — picks a random non-winner from the día's pool and marks them as ganador.
// Supports two raffle types:
//   - "premium": only tipoCliente === "cliente" can participate
//   - "sencilla" (default): clientes + prospectos
// Each raffle has its own ganoEn/entregado/rechazado state, so a client can win both independently.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

type Tipo = 'premium' | 'sencilla'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { dia, tipo } = await request.json()
    if (!dia) return Response.json({ error: 'dia requerido' }, { status: 400 })
    const tipoRifa: Tipo = tipo === 'premium' ? 'premium' : 'sencilla'

    const where = tipoRifa === 'premium'
      ? { diaRifa: dia, tipoCliente: 'cliente', ganoEnPremium: null, entregadoPremium: false, rechazadoPremium: false }
      : { diaRifa: dia, ganoEnSencilla: null, entregadoSencilla: false, rechazadoSencilla: false }

    const candidates = await prisma.participanteRifa.findMany({
      where,
      orderBy: { numeroTicket: 'asc' },
      include: { ejecutivo: { select: { nombre: true } } },
    })

    if (candidates.length === 0) {
      return Response.json({ error: 'No hay participantes elegibles para esta rifa' }, { status: 400 })
    }

    const winner = candidates[Math.floor(Math.random() * candidates.length)]
    const updateData = tipoRifa === 'premium'
      ? { ganoEnPremium: new Date() }
      : { ganoEnSencilla: new Date() }

    const updated = await prisma.participanteRifa.update({
      where: { id: winner.id },
      data: updateData,
      include: { ejecutivo: { select: { nombre: true } } },
    })

    return Response.json({ ganador: updated })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
