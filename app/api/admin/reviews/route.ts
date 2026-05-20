// Admin endpoint — list every review (no limit, newest first).
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const rows = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(rows)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
