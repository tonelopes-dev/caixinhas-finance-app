'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardPage from './dashboard/page';
import { LandingPageClient } from '@/components/landing-page/landing-page-client';

function HomePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se o usuário não está autenticado, mostramos a landing page.
  // O middleware já cuidará de redirecionar para /login se ele tentar acessar rotas protegidas.
  if (!session?.user) {
    return <LandingPageClient />;
  }

  // Se estiver autenticado, renderiza o dashboard.
  // A lógica interna do dashboard e do seletor de cofres cuidará do resto.
  return <DashboardPage />;
}

export default HomePage;
