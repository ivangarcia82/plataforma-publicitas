import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser, authErrorResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const searchParams = request.nextUrl.searchParams
    const accion = searchParams.get('accion')
    const ejecutivoIdParam = searchParams.get('ejecutivoId')

    const where: Prisma.CitaGeneradaWhereInput = {}
    if (accion) where.accion = accion

    if (user.rol === 'ejecutivo') {
      where.ejecutivoId = user.ejecutivoId!
    } else if (ejecutivoIdParam) {
      where.ejecutivoId = ejecutivoIdParam
    }

    const citas = await prisma.citaGenerada.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { ejecutivo: true, cliente: { include: { empresa: true } } },
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

    const data: Prisma.CitaGeneradaCreateInput = {
      fecha: body.fecha,
      accion: body.accion || 'Otro',
      notas: body.notas || '',
      empresaTexto: body.empresaTexto || '',
      contactoTexto: body.contactoTexto || '',
      ejecutivoTexto: body.ejecutivoTexto || '',
    }

    if (user.rol === 'ejecutivo') {
      data.ejecutivo = { connect: { id: user.ejecutivoId! } }
    }

    const cita = await prisma.citaGenerada.create({
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
    const { id, ...rest } = body

    if (user.rol === 'ejecutivo') {
      const existing = await prisma.citaGenerada.findUnique({ where: { id }, select: { ejecutivoId: true } })
      if (!existing || existing.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    const data: Prisma.CitaGeneradaUpdateInput = {}
    if (rest.fecha !== undefined) data.fecha = rest.fecha
    if (rest.accion !== undefined) data.accion = rest.accion
    if (rest.notas !== undefined) data.notas = rest.notas
    if (rest.empresaTexto !== undefined) data.empresaTexto = rest.empresaTexto
    if (rest.contactoTexto !== undefined) data.contactoTexto = rest.contactoTexto
    if (rest.ejecutivoTexto !== undefined) data.ejecutivoTexto = rest.ejecutivoTexto

    const cita = await prisma.citaGenerada.update({
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
      const existing = await prisma.citaGenerada.findUnique({ where: { id }, select: { ejecutivoId: true } })
      if (!existing || existing.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    await prisma.citaGenerada.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
