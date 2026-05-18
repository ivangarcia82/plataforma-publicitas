import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser, authErrorResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const searchParams = request.nextUrl.searchParams
    const dia = searchParams.get('dia')
    const status = searchParams.get('status')
    const ejecutivoIdParam = searchParams.get('ejecutivoId')
    const empresaIdParam = searchParams.get('empresaId')
    const pageParam = searchParams.get('page')
    const pageSizeParam = searchParams.get('pageSize')

    const where: Prisma.CitaComercialWhereInput = {}
    if (dia) where.dia = dia
    if (status) where.status = status
    if (empresaIdParam) where.cliente = { empresaId: empresaIdParam }

    if (user.rol === 'ejecutivo') {
      where.ejecutivoId = user.ejecutivoId!
    } else if (ejecutivoIdParam) {
      where.ejecutivoId = ejecutivoIdParam
    }

    const include = {
      ejecutivo: true,
      cliente: { include: { empresa: true } },
    } as const

    // Pagination kicks in only when page/pageSize are provided. Otherwise return the full
    // array (preserves backward compatibility with /calendario and the home dashboard).
    if (pageParam || pageSizeParam) {
      const page = Math.max(1, Number(pageParam) || 1)
      const pageSize = Math.min(200, Math.max(1, Number(pageSizeParam) || 25))
      const [items, total] = await Promise.all([
        prisma.citaComercial.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.citaComercial.count({ where }),
      ])
      return Response.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) })
    }

    const citas = await prisma.citaComercial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include,
    })
    return Response.json(citas)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const data = { ...body }
    if (user.rol === 'ejecutivo') data.ejecutivoId = user.ejecutivoId!

    // Validate cliente belongs to user's empresas if ejecutivo
    if (user.rol === 'ejecutivo' && data.clienteId) {
      const cli = await prisma.cliente.findUnique({ where: { id: data.clienteId }, select: { empresa: { select: { ejecutivoId: true } } } })
      if (!cli || cli.empresa.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'Cliente no autorizado' }, { status: 403 })
      }
    }

    const cita = await prisma.citaComercial.create({
      data,
      include: { ejecutivo: true, cliente: { include: { empresa: true } } },
    })
    return Response.json(cita, { status: 201 })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const { id, ...data } = body

    if (user.rol === 'ejecutivo') {
      const existing = await prisma.citaComercial.findUnique({ where: { id }, select: { ejecutivoId: true } })
      if (!existing || existing.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
      // Force ejecutivoId to stay theirs
      data.ejecutivoId = user.ejecutivoId
    }

    const cita = await prisma.citaComercial.update({
      where: { id },
      data,
      include: { ejecutivo: true, cliente: { include: { empresa: true } } },
    })
    return Response.json(cita)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser()
    const { id } = await request.json()

    if (user.rol === 'ejecutivo') {
      const existing = await prisma.citaComercial.findUnique({ where: { id }, select: { ejecutivoId: true } })
      if (!existing || existing.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    await prisma.citaComercial.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
