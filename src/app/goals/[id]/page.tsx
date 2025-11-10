import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getGoalDetails } from '../actions';
import { GoalDetailClient } from '@/components/goals/goal-detail-client';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GoalDetailPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

  if (!userId) {
    redirect('/login');
  }

  const { id } = await params;
  const data = await getGoalDetails(id);

  if (!data || !data.goal) {
    notFound();
  }

  return <GoalDetailClient goal={data.goal} transactions={data.transactions} userId={userId} />;
}
