import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const fecha = searchParams.get('fecha')
  const ejecutivoId = searchParams.get('ejecutivoId')

  const where: Prisma.ObsequioWhereInput = {}
  if (fecha) where.fecha = fecha
  if (ejecutivoId) where.ejecutivoId = ejecutivoId

  const obsequios = await prisma.obsequio.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(obsequios)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const obsequio = await prisma.obsequio.create({
    data: body,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(obsequio, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const obsequio = await prisma.obsequio.update({
    where: { id },
    data,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(obsequio)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.obsequio.delete({ where: { id } })
  return Response.json({ success: true })
}
