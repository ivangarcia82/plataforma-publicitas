// Admin endpoint — confirm or reject a winner for a specific raffle type.
// accepted=true  → mark entregado (final), premio entregado
// accepted=false → mark rechazado (final), winner was absent — not returned to pool
// Requires `tipo` so we know which raffle to update.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { id, accepted, tipo } = await request.json()
    if (!id) return Response.json({ error: 'id requerido' }, { status: 400 })
    const tipoRifa = tipo === 'premium' ? 'premium' : 'sencilla'

    const data = tipoRifa === 'premium'
      ? (accepted ? { entregadoPremium: true } : { rechazadoPremium: true })
      : (accepted ? { entregadoSencilla: true } : { rechazadoSencilla: true })

    const updated = await prisma.participanteRifa.update({
      where: { id },
      data,
      include: { ejecutivo: { select: { nombre: true } } },
    })
    return Response.json({ participante: updated })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
