import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        // O middleware agora está configurado para rodar apenas em rotas protegidas.
        // Se chegar aqui, o usuário já foi validado pelo `withAuth`.
        // A lógica principal é redirecionar da raiz para o dashboard se estiver logado.
        const { pathname } = req.nextUrl;
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Se o token não existir, o withAuth redirecionará para a `signIn` page.
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login', // Página de login para onde os usuários não autenticados são enviados.
        },
    }
);


// O matcher agora define explicitamente quais rotas são PROTEGIDAS.
// Rotas como /login, /register, /landing não estão na lista e são públicas por padrão.
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/accounts/:path*',
    '/goals/:path*',
    '/transactions/:path*',
    '/reports/:path*',
    '/invite/:path*',
    '/patrimonio/:path*',
    '/recurring/:path*',
    '/tutorial/:path*',
    '/vaults/:path*',
  ],
};
