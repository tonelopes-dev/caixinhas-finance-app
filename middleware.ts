
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { AuthService } from '@/services';

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // Se o usuário está logado, redireciona de /landing para /vaults
        if (token && pathname.startsWith('/landing')) {
            return NextResponse.redirect(new URL('/vaults', req.url));
        }

        // Se o usuário não está logado, redireciona da raiz para /landing
        // Se estiver logado, redireciona da raiz para /vaults
        if (pathname === '/') {
            const targetUrl = token ? '/vaults' : '/landing';
            return NextResponse.redirect(new URL(targetUrl, req.url));
        }

        // Se não há token e a rota não é pública, o `authorized` callback vai redirecionar
        // para a página de login definida em `pages`.
        if (!token) {
            // A função withAuth já cuida do redirecionamento para a página de login
            // com base na configuração 'pages'.
            // Nenhuma ação explícita é necessária aqui.
        }

        // Lógica de verificação de assinatura/trial para rotas protegidas
        // Vamos assumir que todas as rotas, exceto /vaults, são protegidas por assinatura
        const isProtectedRoute = !pathname.startsWith('/vaults');

        if (token && isProtectedRoute) {
            try {
                const user = await AuthService.getUserById(token.id as string);

                if (user) {
                    const hasActiveSubscription = user.subscriptionStatus === 'active';
                    const hasActiveTrial = AuthService.isTrialActive(user);

                    if (!hasActiveSubscription && !hasActiveTrial) {
                        // Se o trial expirou e não há assinatura, redireciona para /vaults com aviso
                        const url = new URL('/vaults', req.url);
                        url.searchParams.set('status', 'expired');
                        return NextResponse.redirect(url);
                    }
                }
            } catch (error) {
                console.error("Erro ao verificar status do usuário no middleware:", error);
                // Em caso de erro, talvez redirecionar para uma página de erro ou login
                return NextResponse.redirect(new URL('/login?error=session_error', req.url));
            }
        }

        // Se nenhuma das condições acima for atendida, permite que a requisição continue.
        return NextResponse.next();
    },
    {
        callbacks: {
            // Este callback é invocado para decidir se o middleware principal deve ser executado.
            // Retorna `true` se o usuário estiver logado (token existe), permitindo o acesso.
            authorized: ({ token }) => !!token,
        },
        // Se `authorized` retornar `false` (usuário não logado), o NextAuth redirecionará
        // para a página de login especificada aqui.
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
