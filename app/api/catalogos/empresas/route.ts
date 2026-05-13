import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { clientes: true } } },
  })
  return Response.json(empresas)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const empresa = await prisma.empresa.create({ data: body })
  return Response.json(empresa, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const empresa = await prisma.empresa.update({ where: { id }, data })
  return Response.json(empresa)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  try {
    await prisma.empresa.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return Response.json(
        { error: 'No se puede borrar: la empresa tiene contactos o registros asociados.' },
        { status: 409 }
      )
    }
    throw e
  }
}
