// Admin endpoint — lists participants of a specific día for the ruleta.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const dia = request.nextUrl.searchParams.get('dia') || 'Día 1'

    const participantes = await prisma.participanteRifa.findMany({
      where: { diaRifa: dia },
      orderBy: { numeroTicket: 'asc' },
      include: { ejecutivo: { select: { nombre: true } } },
    })

    return Response.json(participantes)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
