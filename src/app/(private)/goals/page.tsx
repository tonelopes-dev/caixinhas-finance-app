
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { authOptions } from '@/lib/auth';
import { GoalsPageClient } from '@/components/goals/goals-page-client';
import { getGoalsPageData } from './actions';

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getGoalsPageData(session.user.id);

  if (!data) {
    return (
      <div className="container max-w-5xl mx-auto p-4 md:p-8">
        <p className="text-center text-muted-foreground">Erro ao carregar dados.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-5xl">
        <BackToDashboard className="mb-4" />
        <div className="flex items-center justify-between space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
          <Link href="/goals/new">
            <Button>Nova Caixinha</Button>
          </Link>
        </div>
        <GoalsPageClient goals={data.goals} vaults={data.vaults} userId={session.user.id} />
      </div>
    </div>
  );
}
