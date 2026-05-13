import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.inventarioObsequio.findMany({ orderBy: { nombre: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.inventarioObsequio.create({
    data: {
      nombre: body.nombre,
      stockTotal: Number(body.stockTotal),
      stockActual: Number(body.stockActual),
      alertaMinimo: Number(body.alertaMinimo) || 5,
    },
  })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.inventarioObsequio.update({
    where: { id: body.id },
    data: {
      nombre: body.nombre,
      stockTotal: Number(body.stockTotal),
      stockActual: Number(body.stockActual),
      alertaMinimo: Number(body.alertaMinimo) || 5,
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  await prisma.inventarioObsequio.delete({ where: { id: body.id } })
  return NextResponse.json({ ok: true })
}
