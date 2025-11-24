
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getGoalDetails } from '../actions';
import { GoalDetailClient } from '@/components/goals/goal-detail-client';

export default async function GoalDetailPage({ params: { id } }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const data = await getGoalDetails(id, session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <GoalDetailClient
      goal={data.goal}
      transactions={data.transactions}
      accounts={data.accounts}
      vaults={data.vaults}
      userId={session.user.id}
    />
  );
}
