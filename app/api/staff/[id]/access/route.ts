import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { requireAdmin, hashPassword, authErrorResponse } from '@/lib/auth'

function makeTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 10; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

// POST: create or reset the user account for this staff member
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const staff = await prisma.staffMember.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!staff) return Response.json({ error: 'Staff no encontrado' }, { status: 404 })
    if (!staff.email) {
      return Response.json({ error: 'Agrega un email al staff antes de crear el acceso' }, { status: 400 })
    }

    const tempPassword = makeTempPassword()
    const passwordHash = await hashPassword(tempPassword)
    const emailLower = staff.email.toLowerCase()

    // If the email is already used by another user, reject.
    const collision = await prisma.user.findUnique({ where: { email: emailLower } })
    if (collision && collision.id !== staff.user?.id) {
      return Response.json({ error: 'Ese email ya está usado por otro usuario' }, { status: 409 })
    }

    if (staff.user) {
      await prisma.user.update({
        where: { id: staff.user.id },
        data: { passwordHash, email: emailLower, nombre: staff.nombre, rol: 'staff' },
      })
    } else {
      await prisma.user.create({
        data: {
          email: emailLower,
          passwordHash,
          nombre: staff.nombre,
          rol: 'staff',
          staffMemberId: staff.id,
        },
      })
    }

    return Response.json({ email: emailLower, tempPassword })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}

// DELETE: revoke (remove) the user account for this staff member
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const staff = await prisma.staffMember.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!staff?.user) return Response.json({ success: true })
    await prisma.user.delete({ where: { id: staff.user.id } })
    return Response.json({ success: true })
  } catch (e) {
    return authErrorResponse(e) || Response.json({ error: 'Internal' }, { status: 500 })
  }
}
