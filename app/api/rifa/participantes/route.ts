// Admin endpoint — lists participants of a specific día for the ruleta.
// `tipo` (premium|sencilla) controls eligibility and which raffle state to return.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const dia = request.nextUrl.searchParams.get('dia') || 'Día 1'
    const tipoParam = request.nextUrl.searchParams.get('tipo') || 'sencilla'
    const tipoRifa = tipoParam === 'premium' ? 'premium' : 'sencilla'

    const where = tipoRifa === 'premium'
      ? { diaRifa: dia, tipoCliente: 'cliente' }
      : { diaRifa: dia }

    const rows = await prisma.participanteRifa.findMany({
      where,
      orderBy: { numeroTicket: 'asc' },
      include: { ejecutivo: { select: { nombre: true } } },
    })

    // Project per-raffle outcome fields into the legacy shape the UI expects.
    const participantes = rows.map(p => ({
      ...p,
      ganoEn: tipoRifa === 'premium' ? p.ganoEnPremium : p.ganoEnSencilla,
      entregado: tipoRifa === 'premium' ? p.entregadoPremium : p.entregadoSencilla,
      rechazado: tipoRifa === 'premium' ? p.rechazadoPremium : p.rechazadoSencilla,
    }))

    return Response.json(participantes)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
