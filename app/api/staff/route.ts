import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dia = searchParams.get('dia')
  const rol = searchParams.get('rol')

  const where: Record<string, string> = {}
  if (dia) where.diaAsignado = dia
  if (rol) where.rol = rol

  const staff = await prisma.staffMember.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(staff)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const member = await prisma.staffMember.create({ data: body })
  return Response.json(member, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const member = await prisma.staffMember.update({ where: { id }, data })
  return Response.json(member)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.staffMember.delete({ where: { id } })
  return Response.json({ success: true })
}
