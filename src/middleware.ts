
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    // A função de middleware é chamada apenas para rotas protegidas pelo matcher.
    // O `withAuth` já lida com o redirecionamento para a página de login.
    function middleware(req) {
        const token = req.nextauth.token;
        const { pathname, origin } = req.nextUrl;

        console.log('🔍 Middleware - Rota:', pathname, 'Token:', !!token);

        // Se não há token e está tentando acessar rota protegida, deixa o withAuth lidar
        if (!token && pathname !== '/login') {
            console.log('❌ Middleware - Sem token, redirecionando para login');
            return NextResponse.redirect(new URL('/login', origin));
        }

        // Se o usuário está logado e tenta acessar a landing page, redireciona para o dashboard
        if (token && pathname.startsWith('/landing')) {
            console.log('✅ Middleware - Token válido em /landing, redirecionando para /dashboard');
            return NextResponse.redirect(new URL('/dashboard', origin));
        }

        // Se está na página de login com token válido, redireciona para dashboard
        if (token && pathname === '/login') {
            console.log('✅ Middleware - Token válido em /login, redirecionando para /dashboard');
            return NextResponse.redirect(new URL('/dashboard', origin));
        }

        // Para todas as outras requisições protegidas, permite o acesso.
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;
                
                // Sempre permitir acesso às páginas públicas
                if (pathname === '/login' || pathname === '/register' || pathname === '/terms' || pathname.startsWith('/landing')) {
                    return true;
                }
                
                // Para rotas protegidas, exigir token
                return !!token;
            }
        },
        pages: {
            signIn: '/login',
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
     * - sw.js: Service worker para PWA
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.webp$|.*\\.json$|favicon.ico|sw.js|login|register|terms|landing).*)',
    // A rota raiz (/) também é incluída para ser gerenciada pelo middleware
    '/',
  ],
};
