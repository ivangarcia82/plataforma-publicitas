import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { put, del } from '@vercel/blob'
import { requireUser, requireAdmin, authErrorResponse } from '@/lib/auth'

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN

async function storeFile(file: File): Promise<{ url: string; tipo: string }> {
  const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
  const safeName = file.name.replace(/\s+/g, '_')
  const key = `${Date.now()}-${safeName}`

  if (useBlob()) {
    const blob = await put(`materiales/${key}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })
    return { url: blob.url, tipo: ext }
  }

  // Filesystem fallback only valid in local dev — Vercel's serverless fs is read-only.
  if (process.env.VERCEL) {
    throw new Error('Almacenamiento no configurado: agrega un Vercel Blob store al proyecto (Storage → Create → Blob).')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filepath = path.join(process.cwd(), 'public', 'uploads', key)
  await writeFile(filepath, buffer)
  return { url: `/uploads/${key}`, tipo: ext }
}

async function removeStored(url: string) {
  if (!url) return
  if (url.startsWith('/uploads/')) {
    try { await unlink(path.join(process.cwd(), 'public', url)) } catch { /* file may not exist */ }
    return
  }
  // Vercel Blob URLs are absolute https URLs
  if (/^https?:\/\/.+\.public\.blob\.vercel-storage\.com\//.test(url)) {
    try { await del(url) } catch { /* already gone */ }
  }
}

export async function GET() {
  try {
    await requireUser()
    const data = await prisma.materialDigital.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) {
    return authErrorResponse(e) || NextResponse.json({ error: 'Internal' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (e) {
    return authErrorResponse(e) || NextResponse.json({ error: 'Internal' }, { status: 500 })
  }
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const nombre = (formData.get('nombre') as string)?.trim()
    const descripcion = (formData.get('descripcion') as string) || ''
    const categoria = (formData.get('categoria') as string) || 'General'

    if (!nombre) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

    let url = ''
    let tipo = 'link'

    if (file && file.size > 0) {
      const stored = await storeFile(file)
      url = stored.url
      tipo = stored.tipo
    } else {
      url = (formData.get('url') as string) || ''
    }

    if (!url) return NextResponse.json({ error: 'Sube un archivo o ingresa una URL' }, { status: 400 })

    const item = await prisma.materialDigital.create({
      data: { nombre, descripcion, categoria, url, tipo },
    })
    return NextResponse.json(item)
  } catch (e) {
    console.error('[materiales POST]', e)
    const msg = e instanceof Error ? e.message : 'Upload failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (e) {
    return authErrorResponse(e) || NextResponse.json({ error: 'Internal' }, { status: 500 })
  }
  try {
    const formData = await req.formData()
    const id = formData.get('id') as string
    const nombre = (formData.get('nombre') as string)?.trim()
    const descripcion = (formData.get('descripcion') as string) || ''
    const categoria = (formData.get('categoria') as string) || 'General'
    const file = formData.get('file') as File | null

    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const updateData: Record<string, string> = { nombre, descripcion, categoria }

    if (file && file.size > 0) {
      const stored = await storeFile(file)
      updateData.url = stored.url
      updateData.tipo = stored.tipo
    }

    const item = await prisma.materialDigital.update({ where: { id }, data: updateData })
    return NextResponse.json(item)
  } catch (e) {
    console.error('[materiales PUT]', e)
    const msg = e instanceof Error ? e.message : 'Update failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (e) {
    return authErrorResponse(e) || NextResponse.json({ error: 'Internal' }, { status: 500 })
  }
  try {
    const body = await req.json()
    const item = await prisma.materialDigital.findUnique({ where: { id: body.id } })
    if (item) await removeStored(item.url)
    await prisma.materialDigital.delete({ where: { id: body.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[materiales DELETE]', e)
    const msg = e instanceof Error ? e.message : 'Delete failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
