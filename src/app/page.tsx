'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from './dashboard/page';
import { LandingPageClient } from '@/components/landing-page/landing-page-client';

function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // No lado do cliente, verificamos se o usuário está logado.
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    if (userId) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se o usuário não está autenticado, mostramos a landing page.
  // O middleware já cuidará de redirecionar para /login se ele tentar acessar rotas protegidas.
  if (!isAuthenticated) {
    return <LandingPageClient />;
  }

  // Se estiver autenticado, renderiza o dashboard.
  // A lógica interna do dashboard e do seletor de cofres cuidará do resto.
  return <DashboardPage />;
}

export default HomePage;
