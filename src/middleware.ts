import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuth } from 'firebase/auth/web-extension';
import { initializeFirebase } from './firebase/server';

const PROTECTED_ROUTES = ['/home', '/profile', '/chat', '/notices', '/timetable'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const { auth } = initializeFirebase();
    const currentUser = auth.currentUser;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !currentUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if ((pathname === '/signin' || pathname === '/signup') && currentUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }

  } catch (err) {
    console.error("Middleware error:", err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
