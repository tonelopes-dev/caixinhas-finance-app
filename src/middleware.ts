
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Middleware simplificado:
// - Não realiza redirecionamentos automáticos que possam causar loops
// - Apenas permite/nega acesso a rotas protegidas via callback `authorized`
// - Mantém páginas públicas acessíveis sem token
export default withAuth(
    // middleware: não faz redirects automáticos, apenas passa a requisição adiante
    (req) => {
        const { pathname } = req.nextUrl;
        console.log('🔍 Middleware - Rota acessada:', pathname);
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname;
                // Páginas públicas
                if (
                    pathname === '/login' ||
                    pathname === '/register' ||
                    pathname === '/terms' ||
                    pathname === '/privacy' ||
                    pathname === '/forgot-password' ||
                    pathname === '/reset-password' ||
                    pathname.startsWith('/invitation') ||
                    pathname.startsWith('/landing') ||
                    pathname.startsWith('/api/auth')
                ) {
                    return true;
                }

                // Para todas as outras rotas, exige token válido
                return !!token;
            },
        },
        pages: {
            signIn: '/login',
        },
    }
);

// Matcher: protege todas as rotas exceto arquivos estáticos e páginas públicas.
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.webp$|.*\\.jpeg$|.*\\.jpg$|.*\\.json$|favicon.ico|sw.js|login|register|invitation|terms|privacy|landing|forgot-password|reset-password).*)',
        '/',
    ],
};
