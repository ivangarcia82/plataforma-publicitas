import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser, authErrorResponse, ejecutivoAccessClause, getAccessibleEjecutivoIds } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const ejecutivoIdParam = request.nextUrl.searchParams.get('ejecutivoId')

    const where: Prisma.EmpresaWhereInput = {
      ...ejecutivoAccessClause(user, ejecutivoIdParam),
    }

    const empresas = await prisma.empresa.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        ejecutivo: true,
        _count: { select: { clientes: true } },
      },
    })
    return Response.json(empresas)
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

    const empresa = await prisma.empresa.create({
      data,
      include: { ejecutivo: true },
    })
    return Response.json(empresa, { status: 201 })
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
      const existing = await prisma.empresa.findUnique({ where: { id }, select: { ejecutivoId: true } })
      if (!existing || existing.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
      // Prevent ejecutivos from reassigning empresas to others
      data.ejecutivoId = user.ejecutivoId
    }

    const empresa = await prisma.empresa.update({
      where: { id },
      data,
      include: { ejecutivo: true },
    })
    return Response.json(empresa)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser()
    const { id } = await request.json()

    if (user.rol === 'ejecutivo') {
      const existing = await prisma.empresa.findUnique({ where: { id }, select: { ejecutivoId: true } })
      if (!existing || existing.ejecutivoId !== user.ejecutivoId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

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
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
