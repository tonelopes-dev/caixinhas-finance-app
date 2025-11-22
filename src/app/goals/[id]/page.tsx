import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoalDetails } from '../actions';
import { GoalDetailClient } from '@/components/goals/goal-detail-client';

type PageProps = {
  params: { id: string };
};

export default async function GoalDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const { id } = params;

  // Agora a função também busca as contas do usuário
  const data = await getGoalDetails(id, userId);

  if (!data || !data.goal) {
    notFound();
  }

  return (
    <GoalDetailClient
      goal={data.goal}
      transactions={data.transactions}
      accounts={data.accounts as any}
      userId={userId}
    />
  );
}
