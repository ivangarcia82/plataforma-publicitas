import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — fetch all reviews, newest first
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// POST — create a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { nombre, empresa, cargo, rating, texto } = body

    if (!nombre || !texto) {
      return NextResponse.json(
        { error: 'Nombre y reseña son obligatorios' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        nombre: nombre.trim(),
        empresa: (empresa || '').trim(),
        cargo: (cargo || '').trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        texto: texto.trim(),
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Error al guardar la reseña' },
      { status: 500 }
    )
  }
}
