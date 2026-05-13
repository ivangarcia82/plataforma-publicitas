// Admin endpoint — returns distinct días that have participants, plus the 3 expo days.
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const rows = await prisma.participanteRifa.groupBy({
      by: ['diaRifa'],
      _count: { _all: true },
    })
    const counts = new Map(rows.map(r => [r.diaRifa, r._count._all]))

    // Always include expo days at the top
    const expoDays = ['Día 1', 'Día 2', 'Día 3']
    const result: { dia: string; count: number }[] = expoDays.map(d => ({ dia: d, count: counts.get(d) || 0 }))

    // Append any other (test/preview) days
    for (const [d, c] of counts.entries()) {
      if (!expoDays.includes(d)) result.push({ dia: d, count: c })
    }

    return Response.json(result)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
