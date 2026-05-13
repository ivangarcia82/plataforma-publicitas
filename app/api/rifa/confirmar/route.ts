// Admin endpoint — confirm or reject a winner.
// accepted=true  → mark entregado, premio entregado (final state)
// accepted=false → mark rechazado, NOT returned to pool (winner was absent)
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { id, accepted } = await request.json()
    if (!id) return Response.json({ error: 'id requerido' }, { status: 400 })

    const updated = await prisma.participanteRifa.update({
      where: { id },
      data: accepted ? { entregado: true } : { rechazado: true },
      include: { ejecutivo: { select: { nombre: true } } },
    })
    return Response.json({ participante: updated })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
