import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/me', '/satisfaccion', '/api/satisfaccion', '/api/satisfaccion/ejecutivos', '/gracias', '/nuevacita', '/api/public/citas-generadas']
const PUBLIC_PREFIXES = ['/uploads/', '/_next/', '/favicon.ico']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get('plataforma_session')?.value
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
