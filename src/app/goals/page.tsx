
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
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
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
      </div>
      <GoalsPageClient data={data} />
    </div>
  );
}
