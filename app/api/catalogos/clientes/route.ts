// app/api/catalogos/clientes/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser, authErrorResponse, getAccessibleEjecutivoIds } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const empresaId = request.nextUrl.searchParams.get('empresaId')

    const where: Prisma.ClienteWhereInput = {}
    if (empresaId) where.empresaId = empresaId
    const accessible = getAccessibleEjecutivoIds(user)
    if (accessible !== null) {
      where.empresa = { ejecutivoId: { in: accessible } }
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: { empresa: true },
    })
    return Response.json(clientes)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()

    if (user.rol === 'ejecutivo' && body.empresaId) {
      const emp = await prisma.empresa.findUnique({ where: { id: body.empresaId }, select: { ejecutivoId: true } })
      if (!emp || emp.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'Empresa no autorizada' }, { status: 403 })
      }
    }

    const cliente = await prisma.cliente.create({
      data: body,
      include: { empresa: true },
    })
    return Response.json(cliente, { status: 201 })
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
      const existing = await prisma.cliente.findUnique({ where: { id }, select: { empresa: { select: { ejecutivoId: true } } } })
      if (!existing || existing.empresa.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
      // If changing empresa, validate the new empresa also belongs to them
      if (data.empresaId) {
        const newEmp = await prisma.empresa.findUnique({ where: { id: data.empresaId }, select: { ejecutivoId: true } })
        if (!newEmp || newEmp.ejecutivoId !== user.ejecutivoId) {
          return Response.json({ error: 'Empresa destino no autorizada' }, { status: 403 })
        }
      }
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data,
      include: { empresa: true },
    })
    return Response.json(cliente)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser()
    const { id } = await request.json()

    if (user.rol === 'ejecutivo') {
      const existing = await prisma.cliente.findUnique({ where: { id }, select: { empresa: { select: { ejecutivoId: true } } } })
      if (!existing || existing.empresa.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

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
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
