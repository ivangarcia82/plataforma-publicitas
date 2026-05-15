import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  if (!email || !password) {
    return Response.json({ error: 'Email y password requeridos' }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }
  await createSession(user.id)
  return Response.json({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
    ejecutivoId: user.ejecutivoId,
    staffMemberId: user.staffMemberId,
  })
}
