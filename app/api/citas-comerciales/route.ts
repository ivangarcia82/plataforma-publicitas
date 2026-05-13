import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dia = searchParams.get('dia')
  const status = searchParams.get('status')
  const ejecutivoId = searchParams.get('ejecutivoId')

  const where: Prisma.CitaComercialWhereInput = {}
  if (dia) where.dia = dia
  if (status) where.status = status
  if (ejecutivoId) where.ejecutivoId = ejecutivoId

  const citas = await prisma.citaComercial.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      ejecutivo: true,
      cliente: { include: { empresa: true } },
    },
  })
  return Response.json(citas)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const cita = await prisma.citaComercial.create({
    data: body,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const cita = await prisma.citaComercial.update({
    where: { id },
    data,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.citaComercial.delete({ where: { id } })
  return Response.json({ success: true })
}
