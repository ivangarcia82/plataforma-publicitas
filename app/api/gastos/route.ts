import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser, authErrorResponse, AuthError } from '@/lib/auth'

const VALID_STATUS = new Set(['Pendiente', 'Aprobado', 'Rechazado', 'Reembolsado'])

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    if (user.rol === 'ejecutivo') throw new AuthError('FORBIDDEN', 403)

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const staffMemberIdParam = searchParams.get('staffMemberId')
    const categoria = searchParams.get('categoria')

    const where: Prisma.GastoStaffWhereInput = {}
    if (status) where.status = status
    if (categoria) where.categoria = categoria

    if (user.rol === 'staff') {
      where.staffMemberId = user.staffMemberId!
    } else if (staffMemberIdParam) {
      where.staffMemberId = staffMemberIdParam
    }

    const gastos = await prisma.gastoStaff.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { staffMember: { select: { id: true, nombre: true, diasAsignados: true } } },
    })
    return Response.json(gastos)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    if (user.rol === 'ejecutivo') throw new AuthError('FORBIDDEN', 403)
    const body = await request.json()

    const staffMemberId = user.rol === 'staff' ? user.staffMemberId! : body.staffMemberId
    if (!staffMemberId) {
      return Response.json({ error: 'staffMemberId requerido' }, { status: 400 })
    }

    const gasto = await prisma.gastoStaff.create({
      data: {
        staffMemberId,
        fecha: body.fecha,
        categoria: body.categoria || 'Otro',
        concepto: body.concepto || '',
        monto: Number(body.monto) || 0,
        comprobanteUrl: body.comprobanteUrl || '',
        notasStaff: body.notasStaff || '',
      },
      include: { staffMember: { select: { id: true, nombre: true, diasAsignados: true } } },
    })
    return Response.json(gasto, { status: 201 })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser()
    if (user.rol === 'ejecutivo') throw new AuthError('FORBIDDEN', 403)
    const body = await request.json()
    const { id, ...data } = body

    const existing = await prisma.gastoStaff.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })

    if (user.rol === 'staff') {
      if (existing.staffMemberId !== user.staffMemberId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
      // Staff cannot edit if already approved or refunded
      if (existing.status !== 'Pendiente') {
        return Response.json({ error: 'No se puede editar un gasto ya revisado' }, { status: 409 })
      }
      // Staff cannot change status / notasAdmin
      delete data.status
      delete data.notasAdmin
      delete data.staffMemberId
      if (data.monto !== undefined) data.monto = Number(data.monto) || 0
    } else {
      // Admin: validate status if provided
      if (data.status && !VALID_STATUS.has(data.status)) {
        return Response.json({ error: 'Status inválido' }, { status: 400 })
      }
      if (data.monto !== undefined) data.monto = Number(data.monto) || 0
    }

    const gasto = await prisma.gastoStaff.update({
      where: { id },
      data,
      include: { staffMember: { select: { id: true, nombre: true, diasAsignados: true } } },
    })
    return Response.json(gasto)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser()
    if (user.rol === 'ejecutivo') throw new AuthError('FORBIDDEN', 403)
    const { id } = await request.json()

    const existing = await prisma.gastoStaff.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })

    if (user.rol === 'staff') {
      if (existing.staffMemberId !== user.staffMemberId) {
        return Response.json({ error: 'No autorizado' }, { status: 403 })
      }
      if (existing.status !== 'Pendiente') {
        return Response.json({ error: 'No se puede eliminar un gasto ya revisado' }, { status: 409 })
      }
    }

    await prisma.gastoStaff.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
