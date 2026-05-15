import { prisma } from '@/lib/prisma'
import { requireStaff, authErrorResponse } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireStaff()
    const staff = await prisma.staffMember.findUnique({
      where: { id: user.staffMemberId! },
      include: { gastos: { orderBy: { createdAt: 'desc' } } },
    })
    if (!staff) return Response.json({ error: 'Staff no encontrado' }, { status: 404 })

    const totals = staff.gastos.reduce(
      (acc, g) => {
        acc.total += g.monto
        acc[g.status] = (acc[g.status] || 0) + g.monto
        return acc
      },
      { total: 0 } as Record<string, number>
    )

    return Response.json({ staff, totals })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
