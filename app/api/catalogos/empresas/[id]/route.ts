import { prisma } from '@/lib/prisma'
import { requireUser, authErrorResponse } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        ejecutivo: true,
        clientes: { orderBy: { nombre: 'asc' } },
      },
    })
    if (!empresa) {
      return Response.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }
    if (user.rol === 'ejecutivo' && empresa.ejecutivoId !== user.ejecutivoId) {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }
    return Response.json(empresa)
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
