
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Middleware simplificado para Edge Runtime
 * A verificação completa de acesso é feita nas páginas individuais
 * usando getServerSession e getAccessInfo
 */
export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // Verificar se há parâmetros que indicam logout ou limpeza de sessão
        const isLoggingOut = req.nextUrl.searchParams.has('logout') || 
                           req.nextUrl.searchParams.has('clear-session');

        // Se está fazendo logout, permitir acesso ao login mesmo com token
        if (isLoggingOut && pathname === '/login') {
            return NextResponse.next();
        }

        // Se o usuário está logado, redireciona de /landing para /vaults
        if (token && pathname.startsWith('/landing')) {
            return NextResponse.redirect(new URL('/vaults', req.url));
        }

        // Se o usuário não está logado, redireciona da raiz para /landing
        // Se estiver logado, redireciona da raiz para /vaults (seleção de workspace)
        if (pathname === '/') {
            const targetUrl = token ? '/vaults' : '/landing';
            return NextResponse.redirect(new URL(targetUrl, req.url));
        }

        // Permite acesso a todas as rotas autenticadas
        // A verificação de acesso completo é feita nas páginas individuais
        return NextResponse.next();
    },
    {
        callbacks: {
            // Permite acesso se o usuário tiver um token válido
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login',
        },
    }
);

// O `matcher` define em quais rotas o middleware será aplicado.
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto aquelas que são explicitamente públicas
     * ou arquivos estáticos. A lógica negativa `(?!...)` é usada para isso.
     * - api: Rotas de API
     * - _next/static: Arquivos estáticos do Next.js
     * - _next/image: Arquivos de otimização de imagem
     * - Várias extensões de arquivo de imagem e manifesto
     * - Rotas públicas: login, register, terms, privacy, landing, forgot-password, reset-password
     */
    '/((?!api|_next/static|_next/image|.*\.png$|.*\.svg$|.*\.webp$|.*\.json$|favicon.ico|login|register|terms|privacy|landing|forgot-password|reset-password).*)',
    // A rota raiz (/) também é incluída para ser gerenciada pelo middleware
    '/',
  ],
};
