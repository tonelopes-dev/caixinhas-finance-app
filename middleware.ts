import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { AuthService } from '@/services';

export const runtime = 'nodejs'; // Força o middleware a rodar no runtime Node.js

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token;

        // Se não há token, a callback 'authorized' já vai redirecionar, mas por segurança:
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Se o usuário está logado e tenta acessar /landing, redireciona para o dashboard
        if (req.nextUrl.pathname.startsWith('/landing') && token) {
            return NextResponse.redirect(new URL('/vaults', req.url));
        }

        // Se o usuário está na raiz, redireciona para /vaults se logado, ou /landing se não logado
        if (req.nextUrl.pathname === '/') {
            if (token) {
                return NextResponse.redirect(new URL('/vaults', req.url));
            }
            return NextResponse.redirect(new URL('/landing', req.url));
        }

        // Lógica de verificação de assinatura/trial para rotas protegidas
        const isProtectedRoute = !req.nextUrl.pathname.startsWith('/vaults');
        if (isProtectedRoute) {
            const user = await AuthService.getUserById(token.id as string);

            if (user) {
                const hasActiveSubscription = user.subscriptionStatus === 'active';
                const hasActiveTrial = AuthService.isTrialActive(user);

                if (!hasActiveSubscription && !hasActiveTrial) {
                    // Se o trial expirou e ele não é assinante, redireciona para a página de cofres com um aviso
                    const url = new URL('/vaults', req.url);
                    url.searchParams.set('status', 'expired');
                    return NextResponse.redirect(url);
                }
            }
        }


        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo-caixinhas.png|icons|manifest.json|screenshots|photos|gradient-underline.svg|login|register|terms|landing).*)',
    '/',
  ],
};
