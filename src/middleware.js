import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kst_apnidukaan';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/api/auth/login',
    '/api/auth/signup',
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
  ];

  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  const authHeader = request.headers.get('Authorization');
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  let isAuthenticated = false;
  let decodedToken = null;

  if (token) {
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (error) {
      isAuthenticated = false;
    }
  }

  const isPortalPath = pathname.startsWith('/portal');
  const isApiProtectedPath = pathname.startsWith('/api/') && !publicPaths.some(path => pathname.startsWith(path));

  if ((isPortalPath || isApiProtectedPath) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};