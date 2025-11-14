import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoalsPageClient } from '@/components/goals/goals-page-client';
import { getUserAllGoals } from './actions';
import { Button } from '@/components/ui/button';

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  const { goals, vaults } = await getUserAllGoals(userId);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>

        <GoalsPageClient 
          goals={goals} 
          vaults={vaults}
          userId={userId}
        />
      </div>
    </div>
  );
}
