'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * Componente que valida se a sessão do usuário ainda é válida
 * Se o usuário foi deletado do banco, faz logout automático
 */
export function SessionValidator() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // Não validar em páginas públicas
    const publicPages = ['/login', '/register', '/terms', '/privacy', '/forgot-password', '/reset-password', '/landing'];
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));
    
    if (isPublicPage) return;

    // Se está autenticado mas não tem dados do usuário, provavelmente foi deletado
    if (status === 'authenticated' && session && !session.user) {
      console.log('⚠️ Sessão inválida detectada - usuário foi deletado. Fazendo logout...');
      
      // Fazer logout e redirecionar para login com mensagem
      signOut({ 
        callbackUrl: '/login?message=user_not_found',
        redirect: true 
      });
    }
  }, [session, status, pathname]);

  return null;
}
