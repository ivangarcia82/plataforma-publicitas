// Public POST endpoint — registers a cita generada from the /nuevacita form.
// No auth required.
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const ACCION_VALID = new Set(['Catálogo', 'Cotización', 'Cita', 'Otro'])

function todayISO(): string {
  const now = new Date()
  const offsetMs = -6 * 60 * 60 * 1000
  return new Date(now.getTime() + offsetMs).toISOString().slice(0, 10)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: 'Datos inválidos' }, { status: 400 })

  const empresaTexto = (body.empresaTexto || '').toString().trim()
  const contactoTexto = (body.contactoTexto || '').toString().trim()
  const ejecutivoTexto = (body.ejecutivoTexto || '').toString().trim()
  const accionRaw = (body.accion || 'Otro').toString()
  const notas = (body.notas || '').toString().trim()
  const fechaInput = (body.fecha || '').toString().trim()

  if (!empresaTexto && !contactoTexto) {
    return Response.json({ error: 'Captura al menos empresa o contacto' }, { status: 400 })
  }

  const accion = ACCION_VALID.has(accionRaw) ? accionRaw : 'Otro'
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(fechaInput) ? fechaInput : todayISO()

  const cita = await prisma.citaGenerada.create({
    data: { fecha, accion, notas, empresaTexto, contactoTexto, ejecutivoTexto },
    select: { id: true },
  })

  return Response.json({ success: true, id: cita.id })
}
