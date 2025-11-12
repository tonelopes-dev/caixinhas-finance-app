import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware gerencia o acesso às rotas da aplicação.
export function middleware(request: NextRequest) {
  const userId = request.cookies.get('CAIXINHAS_USER_ID')?.value;
  const { pathname } = request.nextUrl;

  // Rotas que não devem ser acessadas por usuários logados (ex: login, registro)
  const authRoutes = ['/login', '/register'];

  // Rotas públicas que podem ser acessadas por todos
  const publicRoutes = ['/login', '/register', '/terms', '/landing'];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // A rota raiz (/) é um caso especial
  if (pathname === '/') {
    if (!userId) {
      // Se não estiver logado, vai para a landing page
      return NextResponse.redirect(new URL('/landing', request.url));
    }
    // Se estiver logado, deixa passar para a lógica da HomePage que decidirá o próximo passo (/vaults ou /dashboard)
    return NextResponse.next();
  }

  // Se o usuário está logado
  if (userId) {
    // E tenta acessar uma rota de autenticação (login/registro), redireciona para a seleção de cofres
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/vaults', request.url));
    }
  } 
  // Se o usuário NÃO está logado
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
     * - logo-caixinhas.png (logo file)
     * - icons (PWA icons)
     * - manifest.json (PWA manifest)
     * - screenshots (screenshot files)
     * - photos (photo files)
     * - gradient-underline.svg (image file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo-caixinhas.png|icons|manifest.json|screenshots|photos|gradient-underline.svg).*)',
  ],
};
