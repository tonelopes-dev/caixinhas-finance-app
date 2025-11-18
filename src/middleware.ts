import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// O withAuth já protege todas as rotas por padrão.
// O matcher abaixo define as exceções (rotas públicas).
export default withAuth(
    function middleware(req) {
        // Se o usuário está logado e tenta acessar /landing, redireciona para o dashboard
        if (req.nextUrl.pathname.startsWith('/landing') && req.nextauth.token) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Se o usuário está na raiz, redireciona para o dashboard se logado, ou landing se não logado
        if (req.nextUrl.pathname === '/') {
            if (req.nextauth.token) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            return NextResponse.redirect(new URL('/landing', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Retorna true se o usuário tiver um token (estiver logado)
            // O middleware só será aplicado às rotas que não estão no matcher abaixo
            authorized: ({ token }) => !!token,
        },
    }
);


export const config = {
  // O matcher define quais rotas são protegidas pelo middleware.
  // Usamos uma expressão regular negativa para EXCLUIR as rotas públicas.
  // Todas as outras rotas exigirão autenticação.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo-caixinhas.png|icons|manifest.json|screenshots|photos|gradient-underline.svg|login|register|terms|landing).*)',
    '/', // A rota raiz também precisa ser avaliada para redirecionamento.
  ],
};
