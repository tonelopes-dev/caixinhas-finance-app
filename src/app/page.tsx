
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Aguardar o status ser definitivo antes de redirecionar
    if (status === 'loading') return;
    
    // Redireciona com base no status da autenticação
    if (status === 'unauthenticated') {
      router.replace('/landing');
    } else if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // Não renderiza nada - deixa apenas o LoadingScreen global aparecer
  return null;
}

export default HomePage;
