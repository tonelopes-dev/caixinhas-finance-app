
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLoading } from '@/components/providers/loading-provider';

function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    // Mostrar loading durante verificação da sessão
    if (status === 'loading') {
      showLoading('Verificando sessão...', false);
      return;
    }
    
    // Redireciona com base no status da autenticação
    if (status === 'unauthenticated') {
      hideLoading();
      router.replace('/landing');
    } else if (status === 'authenticated') {
      hideLoading();
      router.replace('/dashboard');
    }
  }, [status, router, showLoading, hideLoading]);

  // LoadingScreen global vai aparecer por cima
  return <div className="min-h-screen bg-background" />;
}

export default HomePage;
