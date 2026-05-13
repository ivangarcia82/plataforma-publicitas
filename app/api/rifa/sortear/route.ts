// Admin endpoint — picks a random non-winner from the día's pool and marks them as ganador.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { dia } = await request.json()
    if (!dia) return Response.json({ error: 'dia requerido' }, { status: 400 })

    const candidates = await prisma.participanteRifa.findMany({
      where: { diaRifa: dia, ganoEn: null },
      orderBy: { numeroTicket: 'asc' },
      include: { ejecutivo: { select: { nombre: true } } },
    })

    if (candidates.length === 0) {
      return Response.json({ error: 'No hay participantes elegibles para esta rifa' }, { status: 400 })
    }

    const winner = candidates[Math.floor(Math.random() * candidates.length)]
    const updated = await prisma.participanteRifa.update({
      where: { id: winner.id },
      data: { ganoEn: new Date() },
      include: { ejecutivo: { select: { nombre: true } } },
    })

    return Response.json({ ganador: updated })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
