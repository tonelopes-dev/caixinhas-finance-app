'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardPage from './dashboard/page';
import { LandingPageClient } from '@/components/landing-page/landing-page-client';

function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // A lógica de redirecionamento agora é centralizada no middleware.
    // Esta página apenas decide qual componente renderizar.
    if (status === 'unauthenticated') {
      router.push('/landing');
    } else if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Enquanto a sessão está sendo verificada, mostramos um loader.
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se o middleware falhou por algum motivo e o usuário chegou aqui sem sessão,
  // mostramos a landing page como fallback.
  if (!session) {
    return <LandingPageClient />;
  }

  // Se a sessão for válida, renderiza o dashboard (ou será redirecionado pelo useEffect).
  return <DashboardPage />;
}

export default HomePage;
