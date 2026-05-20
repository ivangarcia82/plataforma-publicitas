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

const SERVICIOS_VALIDOS = new Set(['digital_evolution', 'promotional_workshop', 'print_shop'])
const GUSTO_VALIDOS = new Set(['beneficios', 'zona_vip', 'tematica', 'obsequios', 'todo'])

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    nombre, empresa, cargo, email, telefono, ejecutivoId, rating, comentario,
    tipoCliente, servicioInteres, npsScore,
    gustoMas, satisfaccionAsesor, npsAsesor,
  } = body

  if (!nombre || !email) {
    return Response.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
  }

  const tipo = tipoCliente === 'prospecto' ? 'prospecto' : 'cliente'

  // Cliente requires asesor; prospecto no.
  if (tipo === 'cliente' && !ejecutivoId) {
    return Response.json({ error: 'Cliente debe indicar su asesor de ventas' }, { status: 400 })
  }
  if (ejecutivoId) {
    const ej = await prisma.ejecutivo.findUnique({ where: { id: ejecutivoId } })
    if (!ej) return Response.json({ error: 'Asesor no válido' }, { status: 400 })
  }

  // Prospecto-specific validation
  let servicioInteresFinal: string | null = null
  let npsScoreFinal: number | null = null
  if (tipo === 'prospecto') {
    if (!servicioInteres || !SERVICIOS_VALIDOS.has(servicioInteres)) {
      return Response.json({ error: 'Servicio de interés inválido' }, { status: 400 })
    }
    const nps = parseInt(npsScore)
    if (Number.isNaN(nps) || nps < 0 || nps > 10) {
      return Response.json({ error: 'NPS debe estar entre 0 y 10' }, { status: 400 })
    }
    servicioInteresFinal = servicioInteres
    npsScoreFinal = nps
  }

  // Cliente-specific validation: gustoMas + servicioInteres + advisor evaluation
  let gustoMasFinal: string[] = []
  let satisfaccionAsesorFinal: number | null = null
  let npsAsesorFinal: number | null = null
  if (tipo === 'cliente') {
    const arr = Array.isArray(gustoMas) ? gustoMas : []
    const cleaned = arr.filter((v: unknown) => typeof v === 'string' && GUSTO_VALIDOS.has(v))
    if (cleaned.length === 0) {
      return Response.json({ error: 'Selecciona al menos una opción de lo que más te gustó' }, { status: 400 })
    }
    gustoMasFinal = Array.from(new Set(cleaned))

    // servicioInteres also applies to cliente (which service most interested them)
    if (!servicioInteres || !SERVICIOS_VALIDOS.has(servicioInteres)) {
      return Response.json({ error: 'Servicio de interés inválido' }, { status: 400 })
    }
    servicioInteresFinal = servicioInteres

    // Company NPS for cliente too (recommend Generando Ideas to a colleague)
    const ns = parseInt(npsScore)
    if (Number.isNaN(ns) || ns < 0 || ns > 10) {
      return Response.json({ error: 'NPS de la empresa debe ser 0-10' }, { status: 400 })
    }
    npsScoreFinal = ns

    const sa = parseInt(satisfaccionAsesor)
    if (Number.isNaN(sa) || sa < 1 || sa > 5) {
      return Response.json({ error: 'Satisfacción con el asesor debe ser 1-5' }, { status: 400 })
    }
    satisfaccionAsesorFinal = sa

    const na = parseInt(npsAsesor)
    if (Number.isNaN(na) || na < 0 || na > 10) {
      return Response.json({ error: 'NPS del asesor debe ser 0-10' }, { status: 400 })
    }
    npsAsesorFinal = na
  }

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
      ejecutivoId: ejecutivoId || null,
      rating: ratingNum,
      comentario: comentarioStr,
      reviewId,
      tipoCliente: tipo,
      servicioInteres: servicioInteresFinal,
      npsScore: npsScoreFinal,
      gustoMas: gustoMasFinal,
      satisfaccionAsesor: satisfaccionAsesorFinal,
      npsAsesor: npsAsesorFinal,
    },
  })

  return Response.json({
    success: true,
    numeroTicket: participante.numeroTicket,
    diaRifa: participante.diaRifa,
    tipoCliente: participante.tipoCliente,
  })
}
