import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rotas que não devem ser acessadas por usuários logados
    const authRoutes = ['/login', '/register'];
    
    // Rotas públicas que podem ser acessadas por todos
    const publicRoutes = ['/login', '/register', '/terms', '/landing'];
    
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    // A rota raiz (/) é um caso especial
    if (pathname === '/') {
      if (!token) {
        // Se não estiver logado, vai para a landing page
        return NextResponse.redirect(new URL('/landing', req.url));
      }
      // Se estiver logado, redireciona para dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Se o usuário está logado
    if (token) {
      // E tenta acessar uma rota de autenticação (login/registro), redireciona para dashboard
      if (authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } 
    // Se o usuário NÃO está logado
    else {
      // E tenta acessar uma rota que NÃO é pública
      if (!isPublicRoute) {
        // Redireciona para o login
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Permite o acesso se nenhuma das condições de redirecionamento acima for atendida
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const publicRoutes = ['/login', '/register', '/terms', '/landing'];
        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
        
        // Permite acesso a rotas públicas sem token
        if (isPublicRoute) return true;
        
        // Permite acesso a todas as rotas protegidas se tiver token
        if (token) return true;
        
        // Bloqueia apenas se não tiver token e não for rota pública
        return false;
      },
    },
  }
);

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
