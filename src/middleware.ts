import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Esta função pode ser marcada como `async` se você precisar usar `await`
export function middleware(request: NextRequest) {
  // Pega o cookie que armazena o ID do usuário
  const userId = request.cookies.get('DREAMVAULT_USER_ID');
  const { pathname } = request.nextUrl;

  // Lista de rotas públicas que não exigem login
  const publicPaths = ['/login', '/register', '/terms'];

  // Verifica se a rota acessada é pública
  const isPublicRoute = publicPaths.some(path => pathname.startsWith(path));

  // Se não há ID de usuário e a rota não é pública, redireciona para o login
  if (!userId && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se o usuário está logado e tenta acessar as páginas de login ou registro,
  // redireciona para a página de seleção de cofres (ou para o painel principal)
  if (userId && (pathname === '/login' || pathname === '/register')) {
      const url = request.nextUrl.clone();
      url.pathname = '/vaults';
      return NextResponse.redirect(url);
  }

  // Se nenhuma das condições acima for atendida, permite que a requisição continue
  return NextResponse.next();
}

// O 'matcher' define em quais rotas o middleware deve ser executado.
// Isso evita que ele rode em rotas de API, arquivos estáticos da Next.js, etc.
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto os que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (ícone do site)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};
