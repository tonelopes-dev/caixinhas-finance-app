import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware gerencia o acesso às rotas da aplicação.
export function middleware(request: NextRequest) {
  const userId = request.cookies.get('DREAMVAULT_USER_ID')?.value;
  const { pathname } = request.nextUrl;

  // Rotas públicas que não exigem autenticação
  const publicRoutes = ['/login', '/register', '/terms'];

  // Se o usuário está logado
  if (userId) {
    // Se ele tentar acessar as rotas de login ou registro, redireciona para a seleção de cofres
    if (publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/vaults', request.url));
    }
  } 
  // Se o usuário NÃO está logado
  else {
    // E tenta acessar qualquer rota que não seja pública
    if (!publicRoutes.includes(pathname)) {
      // Redireciona para o login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Permite o acesso se nenhuma das condições acima for atendida
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
