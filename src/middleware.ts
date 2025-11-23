import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    // `withAuth` aprimora sua Request com o token do usuário.
    // A lógica de redirecionamento pode ser feita aqui.
    function middleware(req) {
        const token = req.nextauth.token;

        // Se o usuário está logado e tenta acessar /landing, redireciona para o dashboard
        if (req.nextUrl.pathname.startsWith('/landing') && token) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Se o usuário está na raiz, redireciona para /dashboard se logado, ou /landing se não logado
        if (req.nextUrl.pathname === '/') {
            if (token) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            return NextResponse.redirect(new URL('/landing', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Retorna `true` se o token existir (usuário logado).
            // O middleware só será invocado para as rotas no `matcher`.
            authorized: ({ token }) => !!token,
        },
        // Se `authorized` retornar `false`, o usuário é redirecionado para a página de login.
        pages: {
            signIn: '/login',
        },
    }
);

// O `matcher` define quais rotas são protegidas pelo middleware.
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto as que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (ícone do site)
     * - Rotas públicas explícitas
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.json$|favicon.ico|login|register|terms|landing).*)',
    '/', // Inclui a rota raiz para ser tratada pelo middleware
  ],
};
