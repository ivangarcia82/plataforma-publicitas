// Public endpoint — lists active ejecutivos for the satisfaction form's selector.
// No auth required.
import { prisma } from '@/lib/prisma'

export async function GET() {
  const ejecutivos = await prisma.ejecutivo.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  })
  return Response.json(ejecutivos)
}
