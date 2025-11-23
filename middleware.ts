
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { AuthService } from '@/services';

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // Se o usuário está logado, redireciona de /landing para /dashboard
        if (token && pathname.startsWith('/landing')) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Se o usuário não está logado, redireciona da raiz para /landing
        // Se estiver logado, redireciona da raiz para /dashboard
        if (pathname === '/') {
            const targetUrl = token ? '/dashboard' : '/landing';
            return NextResponse.redirect(new URL(targetUrl, req.url));
        }

        // Permite acesso a todas as rotas autenticadas sem verificação de assinatura
        // (verificação de assinatura pode ser feita nas páginas específicas se necessário)
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
     * - Rotas públicas: login, register, terms, landing
     */
    '/((?!api|_next/static|_next/image|.*\.png$|.*\.svg$|.*\.webp$|.*\.json$|favicon.ico|login|register|terms|landing).*)',
    // A rota raiz (/) também é incluída para ser gerenciada pelo middleware
    '/',
  ],
};
