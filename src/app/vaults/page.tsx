import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserVaultsData } from './actions';
import { VaultsPageClient } from '@/components/vaults';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services';

type VaultsPageProps = {
  searchParams?: {
    status?: string;
  };
};

export default async function VaultSelectionPage({ searchParams }: VaultsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const [data, user] = await Promise.all([
    getUserVaultsData(userId),
    AuthService.getUserById(userId),
  ]);

  if (!data || !user) {
    redirect('/login');
  }

  const hasActiveSubscription = user.subscriptionStatus === 'active';
  const hasActiveTrial = AuthService.isTrialActive(user);
  const showExpiredAlert = !hasActiveSubscription && !hasActiveTrial;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        {showExpiredAlert && (
          <Alert variant="destructive" className="mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Seu acesso expirou!</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row justify-between items-center gap-4">
              Seu período de teste terminou. Para continuar usando seu espaço pessoal e criar novos cofres, por favor, assine um de nossos planos.
              <Button asChild size="sm">
                <Link href="/pricing">Ver Planos</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <VaultsPageClient {...data} />
      </div>
    </div>
  );
}
