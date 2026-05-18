import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser, requireAdmin, authErrorResponse, getAccessibleEjecutivoIds } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const searchParams = request.nextUrl.searchParams
    const activo = searchParams.get('activo')

    const where: Prisma.EjecutivoWhereInput = {}
    if (activo === 'true') where.activo = true
    if (activo === 'false') where.activo = false

    // Ejecutivos ven sólo a ellos mismos + a su equipo (si son managers)
    const accessible = getAccessibleEjecutivoIds(user)
    if (accessible !== null) {
      where.id = { in: accessible }
    }

    const ejecutivos = await prisma.ejecutivo.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })
    return Response.json(ejecutivos)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const ejecutivo = await prisma.ejecutivo.create({ data: body })
    return Response.json(ejecutivo, { status: 201 })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, ...data } = body
    const ejecutivo = await prisma.ejecutivo.update({ where: { id }, data })
    return Response.json(ejecutivo)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
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
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
