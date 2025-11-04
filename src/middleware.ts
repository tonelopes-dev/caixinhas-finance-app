import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('DREAMVAULT_USER_ID')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login' || pathname === '/register' || pathname === '/terms';

  // If the user is logged in and tries to access a public path like login/register,
  // redirect them to the vaults page.
  if (userId && isPublicPath) {
    return NextResponse.redirect(new URL('/vaults', request.url));
  }

  // If the user is not logged in and is trying to access a private path,
  // redirect them to the login page.
  if (!userId && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise, allow the request to proceed.
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
     * - icons (PWA icons)
     * - manifest.json (PWA manifest)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};
