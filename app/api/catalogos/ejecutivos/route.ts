import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const activo = searchParams.get('activo')

  const where: Prisma.EjecutivoWhereInput = {}
  if (activo === 'true') where.activo = true
  if (activo === 'false') where.activo = false

  const ejecutivos = await prisma.ejecutivo.findMany({
    where,
    orderBy: { nombre: 'asc' },
  })
  return Response.json(ejecutivos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const ejecutivo = await prisma.ejecutivo.create({ data: body })
  return Response.json(ejecutivo, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const ejecutivo = await prisma.ejecutivo.update({ where: { id }, data })
  return Response.json(ejecutivo)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  try {
    await prisma.ejecutivo.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return Response.json(
        { error: 'No se puede borrar: tiene registros asociados. Desactívalo en su lugar.' },
        { status: 409 }
      )
    }
    throw e
  }
}
