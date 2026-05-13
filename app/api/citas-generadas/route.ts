import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const accion = searchParams.get('accion')
  const ejecutivoId = searchParams.get('ejecutivoId')

  const where: Prisma.CitaGeneradaWhereInput = {}
  if (accion) where.accion = accion
  if (ejecutivoId) where.ejecutivoId = ejecutivoId

  const citas = await prisma.citaGenerada.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(citas)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const cita = await prisma.citaGenerada.create({
    data: body,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const cita = await prisma.citaGenerada.update({
    where: { id },
    data,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.citaGenerada.delete({ where: { id } })
  return Response.json({ success: true })
}
