'use client';

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const { token } = req.nextauth;
        const { pathname } = req.nextUrl;

        // Se o usuário está logado e tenta acessar /landing ou /register, redireciona para /vaults
        if (token && (pathname.startsWith('/landing') || pathname.startsWith('/register'))) {
            return NextResponse.redirect(new URL('/vaults', req.url));
        }

        // Se o usuário está na raiz, redireciona para /vaults se logado, ou /landing se não logado
        if (pathname === '/') {
            return NextResponse.redirect(new URL(token ? '/vaults' : '/landing', req.url));
        }

        // A lógica de verificação de trial/assinatura foi movida para a página /vaults.
        // O middleware agora apenas protege as rotas.

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login',
        },
    }
);


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo-caixinhas.png|icons|manifest.json|screenshots|photos|gradient-underline.svg|login|register|terms|auth).*)',
    '/',
    '/landing',
  ],
};
