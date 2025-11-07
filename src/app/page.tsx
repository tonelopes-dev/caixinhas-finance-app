'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/auth/with-auth';
import DashboardPage from './dashboard/page';

function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // A lógica de withAuth cuidará de verificar o usuário.
    // Se o withAuth nos deixar renderizar, significa que o usuário está autenticado.
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    if (userId) {
      setIsAuthenticated(true);
      const vaultId = sessionStorage.getItem('CAIXINHAS_VAULT_ID');
      if (vaultId) {
        // Usuário logado e com cofre selecionado, vai para o dashboard
        router.replace('/dashboard');
      } else {
        // Usuário logado mas sem cofre, vai para a seleção de cofres
        router.replace('/vaults');
      }
    } else {
       // Usuário não logado, vai para a nova landing page
       router.replace('/landing');
    }
  }, [router]);

  // Enquanto verifica, podemos mostrar um loader para evitar piscar de conteúdo.
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se estiver autenticado e com cofre, renderiza o dashboard.
  // Caso contrário, o useEffect já terá redirecionado.
  return <DashboardPage />;
}

// O HOC withAuth ainda pode ser útil para proteger esta rota como uma camada extra,
// mas o redirecionamento principal é feito no useEffect.
export default HomePage;
