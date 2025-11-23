
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redireciona com base no status da autenticação
    if (status === 'unauthenticated') {
      router.replace('/landing');
    } else if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // Enquanto a sessão está sendo verificada, mostramos um loader.
  return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
}

export default HomePage;
