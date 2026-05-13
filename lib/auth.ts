import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE = 'plataforma_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production-please'

export interface SessionUser {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'ejecutivo'
  ejecutivoId: string | null
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function createSession(userId: string): Promise<void> {
  const payload = `${userId}.${Date.now()}`
  const token = `${payload}.${sign(payload)}`
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, ts, mac] = parts
  if (!safeEqual(mac, sign(`${userId}.${ts}`))) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol as 'admin' | 'ejecutivo',
    ejecutivoId: user.ejecutivoId,
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError('UNAUTHORIZED', 401)
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.rol !== 'admin') throw new AuthError('FORBIDDEN', 403)
  return user
}

export class AuthError extends Error {
  constructor(public code: 'UNAUTHORIZED' | 'FORBIDDEN', public status: number) {
    super(code)
  }
}

export function authErrorResponse(e: unknown): Response | null {
  if (e instanceof AuthError) {
    return Response.json({ error: e.code }, { status: e.status })
  }
  return null
}
