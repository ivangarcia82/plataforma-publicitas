// Admin endpoint — list every raffle participant with full detail for the admin panel.
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const rows = await prisma.participanteRifa.findMany({
      orderBy: { createdAt: 'desc' },
      include: { ejecutivo: { select: { id: true, nombre: true } } },
    })
    return Response.json(rows)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
