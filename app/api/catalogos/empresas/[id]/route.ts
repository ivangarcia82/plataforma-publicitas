import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: {
      clientes: { orderBy: { nombre: 'asc' } },
    },
  })
  if (!empresa) {
    return Response.json({ error: 'Empresa no encontrada' }, { status: 404 })
  }
  return Response.json(empresa)
}
