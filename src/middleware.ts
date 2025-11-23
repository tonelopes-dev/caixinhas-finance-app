
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    // A função de middleware é chamada apenas para rotas protegidas pelo matcher.
    // O `withAuth` já lida com o redirecionamento para a página de login.
    function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // Se o usuário está logado e tenta acessar a landing page, redireciona para o dashboard
        if (token && pathname.startsWith('/landing')) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Para todas as outras requisições protegidas, permite o acesso.
        return NextResponse.next();
    },
    {
        pages: {
            signIn: '/login', // Página para a qual redirecionar se o usuário não estiver logado
        },
    }
);

// O `matcher` define em quais rotas o middleware será aplicado.
// Esta configuração protege todas as rotas, exceto as listadas.
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto aquelas que são explicitamente públicas
     * ou arquivos estáticos. A lógica negativa `(?!...)` é usada para isso.
     * - api: Rotas de API (incluindo as do next-auth)
     * - _next/static: Arquivos estáticos do Next.js
     * - _next/image: Arquivos de otimização de imagem
     * - Várias extensões de arquivo de imagem e manifesto
     * - Rotas públicas: login, register, terms, landing
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.webp$|.*\\.json$|favicon.ico|login|register|terms|landing).*)',
    // A rota raiz (/) também é incluída para ser gerenciada pelo middleware
    '/',
  ],
};
