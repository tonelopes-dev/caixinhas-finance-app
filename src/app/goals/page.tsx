
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/auth';
import { GoalsPageClient } from '@/components/goals/goals-page-client';
import { getGoalsPageData } from './actions';

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const data = await getGoalsPageData(session.user.id);

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
        <Link href="/goals/new">
          <Button>Nova Caixinha</Button>
        </Link>
      </div>
      <GoalsPageClient data={data} />
    </div>
  );
}
