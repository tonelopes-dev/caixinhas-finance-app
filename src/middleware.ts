import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware gerencia o acesso às rotas da aplicação.
export function middleware(request: NextRequest) {
  const userId = request.cookies.get('CAIXINHAS_USER_ID')?.value;
  const { pathname } = request.nextUrl;

  // Rotas públicas que não exigem autenticação
  const publicRoutes = ['/login', '/register', '/terms', '/landing'];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // A rota raiz (/) também é tratada como pública para permitir o redirecionamento inicial.
  if (pathname === '/') {
    if (!userId) {
      return NextResponse.redirect(new URL('/landing', request.url));
    }
    // Se estiver logado, deixa passar para a lógica da HomePage que redirecionará para /vaults ou /dashboard
    return NextResponse.next();
  }


  // Se o usuário está logado (tem o cookie)
  if (userId) {
    // E tenta acessar uma rota pública (login/registro), redireciona para a seleção de cofres
    if (publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/vaults', request.url));
    }
  } 
  // Se o usuário NÃO está logado (não tem o cookie)
  else {
    // E tenta acessar uma rota que NÃO é pública
    if (!isPublicRoute) {
      // Redireciona para o login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Permite o acesso se nenhuma das condições de redirecionamento acima for atendida
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
