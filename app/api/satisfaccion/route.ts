// Public POST endpoint — registers a satisfaction response.
// Creates a ParticipanteRifa entry for today's draw and an optional Review.
// No auth required.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const EXPO_DAYS: Record<string, string> = {
  '2026-05-20': 'Día 1',
  '2026-05-21': 'Día 2',
  '2026-05-22': 'Día 3',
}

function todayLabel(): string {
  const now = new Date()
  // Use America/Mexico_City timezone (UTC-6 during May = no DST in MX since 2022)
  const offsetMs = -6 * 60 * 60 * 1000
  const localDate = new Date(now.getTime() + offsetMs)
  const iso = localDate.toISOString().slice(0, 10)
  // Pre/post-expo (testing or leftover traffic) → defaults to "Día 1"
  return EXPO_DAYS[iso] || 'Día 1'
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nombre, empresa, cargo, email, telefono, ejecutivoId, rating, comentario } = body

  if (!nombre || !email || !ejecutivoId) {
    return Response.json({ error: 'Nombre, email y ejecutivo son requeridos' }, { status: 400 })
  }

  const ej = await prisma.ejecutivo.findUnique({ where: { id: ejecutivoId } })
  if (!ej) return Response.json({ error: 'Ejecutivo no válido' }, { status: 400 })

  const diaRifa = todayLabel()
  const ratingNum = Math.min(5, Math.max(1, parseInt(rating) || 5))
  const comentarioStr = (comentario || '').toString().trim()

  // Compute next ticket number for this día (concurrent-safe-ish; for a small expo this is fine)
  const lastTicket = await prisma.participanteRifa.findFirst({
    where: { diaRifa },
    orderBy: { numeroTicket: 'desc' },
    select: { numeroTicket: true },
  })
  const numeroTicket = (lastTicket?.numeroTicket || 0) + 1

  // Create Review if there's a comment (so it shows in /reviews module)
  let reviewId: string | null = null
  if (comentarioStr.length > 0) {
    const review = await prisma.review.create({
      data: {
        nombre,
        empresa: empresa || '',
        cargo: cargo || '',
        rating: ratingNum,
        texto: comentarioStr,
      },
    })
    reviewId = review.id
  }

  const participante = await prisma.participanteRifa.create({
    data: {
      nombre,
      empresa: empresa || '',
      cargo: cargo || '',
      email: email.toLowerCase(),
      telefono: telefono || '',
      diaRifa,
      numeroTicket,
      ejecutivoId,
      rating: ratingNum,
      comentario: comentarioStr,
      reviewId,
    },
  })

  return Response.json({
    success: true,
    numeroTicket: participante.numeroTicket,
    diaRifa: participante.diaRifa,
  })
}
