import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser, requireAdmin, authErrorResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireUser()
    const searchParams = request.nextUrl.searchParams
    const dia = searchParams.get('dia')
    const rol = searchParams.get('rol')
    const activo = searchParams.get('activo')

    const where: Prisma.StaffMemberWhereInput = {}
    if (dia) where.diaAsignado = dia
    if (rol) where.rol = rol
    if (activo === 'true') where.activo = true
    if (activo === 'false') where.activo = false

    const staff = await prisma.staffMember.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } } },
    })
    return Response.json(staff)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const member = await prisma.staffMember.create({
      data: {
        nombre: body.nombre,
        rol: body.rol || 'Staff',
        diaAsignado: body.diaAsignado,
        horarioEntrada: body.horarioEntrada,
        horarioSalida: body.horarioSalida,
        horaComida: body.horaComida || '',
        seccion: body.seccion || '',
        viaticoCantidad: Number(body.viaticoCantidad) || 0,
        viaticoStatus: body.viaticoStatus || 'Pendiente',
        email: body.email || '',
        telefono: body.telefono || '',
        activo: body.activo !== undefined ? Boolean(body.activo) : true,
      },
      include: { user: { select: { id: true, email: true } } },
    })
    return Response.json(member, { status: 201 })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, ...rest } = body
    const data: Prisma.StaffMemberUpdateInput = {}
    if (rest.nombre !== undefined) data.nombre = rest.nombre
    if (rest.rol !== undefined) data.rol = rest.rol
    if (rest.diaAsignado !== undefined) data.diaAsignado = rest.diaAsignado
    if (rest.horarioEntrada !== undefined) data.horarioEntrada = rest.horarioEntrada
    if (rest.horarioSalida !== undefined) data.horarioSalida = rest.horarioSalida
    if (rest.horaComida !== undefined) data.horaComida = rest.horaComida
    if (rest.seccion !== undefined) data.seccion = rest.seccion
    if (rest.viaticoCantidad !== undefined) data.viaticoCantidad = Number(rest.viaticoCantidad) || 0
    if (rest.viaticoStatus !== undefined) data.viaticoStatus = rest.viaticoStatus
    if (rest.email !== undefined) data.email = rest.email
    if (rest.telefono !== undefined) data.telefono = rest.telefono
    if (rest.activo !== undefined) data.activo = Boolean(rest.activo)

    const member = await prisma.staffMember.update({
      where: { id },
      data,
      include: { user: { select: { id: true, email: true } } },
    })
    return Response.json(member)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const { id } = await request.json()
    try {
      await prisma.staffMember.delete({ where: { id } })
      return Response.json({ success: true })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        return Response.json(
          { error: 'No se puede borrar: tiene un usuario asociado. Desactívalo en su lugar.' },
          { status: 409 }
        )
      }
      throw e
    }
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
