import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Protección de rutas en el frontend (HU-01).
 * - Sin sesión válida → /login
 * - /admin solo para ADMIN; /caja solo para OPERATOR
 * La API vuelve a validar el JWT y el rol en cada endpoint (defensa en profundidad).
 */
const COOKIE = 'gopark_token';
const HOME: Record<string, string> = { ADMIN: '/admin', OPERATOR: '/caja' };
const AREA_ROLE: Record<string, string> = { '/admin': 'ADMIN', '/caja': 'OPERATOR' };

async function readRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null; // token vencido o alterado
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await readRole(req);

  if (pathname === '/login' || pathname === '/') {
    return role ? NextResponse.redirect(new URL(HOME[role] ?? '/login', req.url)) : pathname === '/'
      ? NextResponse.redirect(new URL('/login', req.url))
      : NextResponse.next();
  }

  const area = Object.keys(AREA_ROLE).find((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (area) {
    if (!role) {
      const url = new URL('/login', req.url);
      url.searchParams.set('next', pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete(COOKIE);
      return res;
    }
    if (AREA_ROLE[area] !== role) return NextResponse.redirect(new URL(HOME[role] ?? '/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/', '/login', '/caja/:path*', '/admin/:path*'] };
