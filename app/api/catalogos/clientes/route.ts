// app/api/catalogos/clientes/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get('empresaId')

  const where: Prisma.ClienteWhereInput = {}
  if (empresaId) where.empresaId = empresaId

  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { nombre: 'asc' },
    include: { empresa: true },
  })
  return Response.json(clientes)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const cliente = await prisma.cliente.create({
    data: body,
    include: { empresa: true },
  })
  return Response.json(cliente, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const cliente = await prisma.cliente.update({
    where: { id },
    data,
    include: { empresa: true },
  })
  return Response.json(cliente)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  try {
    await prisma.cliente.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return Response.json(
        { error: 'No se puede borrar: el cliente tiene citas u obsequios asociados.' },
        { status: 409 }
      )
    }
    throw e
  }
}
