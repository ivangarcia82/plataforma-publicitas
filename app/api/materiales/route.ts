import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

export async function GET() {
  const data = await prisma.materialDigital.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const nombre = formData.get('nombre') as string
  const descripcion = (formData.get('descripcion') as string) || ''
  const categoria = (formData.get('categoria') as string) || 'General'

  let url = ''
  let tipo = 'link'

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'pdf'
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
    await writeFile(filepath, buffer)
    url = `/uploads/${filename}`
    tipo = ext.toLowerCase()
  } else {
    url = (formData.get('url') as string) || ''
  }

  const item = await prisma.materialDigital.create({
    data: { nombre, descripcion, categoria, url, tipo },
  })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData()
  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const descripcion = (formData.get('descripcion') as string) || ''
  const categoria = (formData.get('categoria') as string) || 'General'
  const file = formData.get('file') as File | null

  const updateData: Record<string, string> = { nombre, descripcion, categoria }

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'pdf'
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
    await writeFile(filepath, buffer)
    updateData.url = `/uploads/${filename}`
    updateData.tipo = ext.toLowerCase()
  }

  const item = await prisma.materialDigital.update({ where: { id }, data: updateData })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.materialDigital.findUnique({ where: { id: body.id } })
  if (item && item.url.startsWith('/uploads/')) {
    try {
      await unlink(path.join(process.cwd(), 'public', item.url))
    } catch { /* file may not exist */ }
  }
  await prisma.materialDigital.delete({ where: { id: body.id } })
  return NextResponse.json({ ok: true })
}
