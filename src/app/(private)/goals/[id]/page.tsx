
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getGoalDetails } from '../actions'; 
import { GoalDetailClient } from '@/components/goals/goal-detail-client';

// A anotação de tipo foi removida para permitir a inferência pelo Next.js
export default async function GoalDetailPage({ params }) {
  const id = params.id;
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
