// Admin endpoint — export CitaComercial + CitaGenerada to a single .xlsx file with two sheets.
// Filters: ?from=YYYY-MM-DD&to=YYYY-MM-DD (against createdAt) and ?ejecutivoId=...
import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'
import { requireAdmin, authErrorResponse } from '@/lib/auth'

function parseDateBound(value: string | null, endOfDay = false): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  if (endOfDay) d.setHours(23, 59, 59, 999)
  else d.setHours(0, 0, 0, 0)
  return d
}

function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const sp = request.nextUrl.searchParams
    const from = parseDateBound(sp.get('from'), false)
    const to = parseDateBound(sp.get('to'), true)
    const ejecutivoId = sp.get('ejecutivoId') || undefined

    const createdAt = from || to ? { gte: from, lte: to } : undefined

    const [comerciales, generadas] = await Promise.all([
      prisma.citaComercial.findMany({
        where: {
          ...(ejecutivoId ? { ejecutivoId } : {}),
          ...(createdAt ? { createdAt } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          ejecutivo: { select: { nombre: true, email: true, cargo: true } },
          cliente: { select: { nombre: true, cargo: true, email: true, telefono: true, empresa: { select: { nombre: true, ciudadEstado: true } } } },
        },
      }),
      prisma.citaGenerada.findMany({
        where: {
          ...(ejecutivoId ? { ejecutivoId } : {}),
          ...(createdAt ? { createdAt } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          ejecutivo: { select: { nombre: true, email: true, cargo: true } },
          cliente: { select: { nombre: true, cargo: true, email: true, telefono: true, empresa: { select: { nombre: true, ciudadEstado: true } } } },
        },
      }),
    ])

    const sheetComercial = comerciales.map(c => ({
      'Fecha registro': formatDateTime(c.createdAt),
      'Última actualización': formatDateTime(c.updatedAt),
      Ejecutivo: c.ejecutivo?.nombre ?? '',
      'Email ejecutivo': c.ejecutivo?.email ?? '',
      'Cargo ejecutivo': c.ejecutivo?.cargo ?? '',
      Cliente: c.cliente?.nombre ?? '',
      'Cargo cliente': c.cliente?.cargo ?? '',
      'Email cliente': c.cliente?.email ?? '',
      'Teléfono cliente': c.cliente?.telefono ?? '',
      Empresa: c.cliente?.empresa?.nombre ?? '',
      'Ciudad / Estado': c.cliente?.empresa?.ciudadEstado ?? '',
      Día: c.dia,
      Horario: c.horario,
      Status: c.status,
      Transporte: c.transporte,
      Notas: c.notas,
      ID: c.id,
    }))

    const sheetGenerada = generadas.map(g => ({
      'Fecha registro': formatDateTime(g.createdAt),
      'Última actualización': formatDateTime(g.updatedAt),
      'Fecha cita': g.fecha,
      Ejecutivo: g.ejecutivo?.nombre || g.ejecutivoTexto || '',
      'Email ejecutivo': g.ejecutivo?.email ?? '',
      'Cargo ejecutivo': g.ejecutivo?.cargo ?? '',
      Cliente: g.cliente?.nombre || g.contactoTexto || '',
      'Cargo cliente': g.cliente?.cargo ?? '',
      'Email cliente': g.cliente?.email ?? '',
      'Teléfono cliente': g.cliente?.telefono ?? '',
      Empresa: g.cliente?.empresa?.nombre || g.empresaTexto || '',
      'Ciudad / Estado': g.cliente?.empresa?.ciudadEstado ?? '',
      Acción: g.accion,
      Notas: g.notas,
      ID: g.id,
    }))

    const wb = XLSX.utils.book_new()
    const wsComercial = XLSX.utils.json_to_sheet(sheetComercial.length ? sheetComercial : [{ Aviso: 'Sin registros en el rango seleccionado' }])
    const wsGenerada = XLSX.utils.json_to_sheet(sheetGenerada.length ? sheetGenerada : [{ Aviso: 'Sin registros en el rango seleccionado' }])
    XLSX.utils.book_append_sheet(wb, wsComercial, 'Citas Comerciales')
    XLSX.utils.book_append_sheet(wb, wsGenerada, 'Citas Generadas')

    const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const stamp = new Date().toISOString().slice(0, 10)
    const filename = `citas-${stamp}.xlsx`

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
