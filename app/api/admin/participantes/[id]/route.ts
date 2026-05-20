// Admin endpoint — delete a single raffle participant.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    await prisma.participanteRifa.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
