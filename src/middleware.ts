import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { validateUserSession } from './lib/auth-helpers';

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rotas públicas que podem ser acessadas por todos
    const publicRoutes = ['/login', '/register', '/terms', '/landing'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // A rota raiz (/) é um caso especial
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Se o usuário está autenticado
    if (token && token.id) {
      // E tenta acessar uma rota de autenticação (login/registro), redireciona para dashboard
      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Valida a sessão do usuário no banco de dados para cada request em rota protegida
      const isSessionValid = await validateUserSession(token.id as string);
      
      // Se a sessão não for válida (usuário deletado, etc.), força o logout
      if (!isSessionValid) {
        const logoutUrl = new URL('/login', req.url);
        logoutUrl.searchParams.set('callbackUrl', req.url);
        
        const response = NextResponse.redirect(logoutUrl);
        
        // Limpa os cookies de autenticação do NextAuth
        const cookieNames = Object.keys(req.cookies).filter(name => name.startsWith('next-auth.'));
        cookieNames.forEach(name => response.cookies.delete(name));
        
        return response;
      }
    }

    // Se nenhuma das condições acima for atendida, permite o acesso.
    // A verificação de `authorized` do withAuth já cuida do redirecionamento de não logados.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // `authorized` só precisa verificar a existência do token.
        // A validação de sessão no banco é feita no corpo do middleware.
        return !!token;
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
