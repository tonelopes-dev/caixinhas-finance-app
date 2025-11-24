
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { getGoalManageData } from '@/app/goals/actions';
import { ManageGoalClient } from '@/components/goals/manage-goal-client';

export default async function ManageGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // No Next.js 15, params precisa ser aguardado
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const data = await getGoalManageData(id, session.user.id);

  if (!data) {
    notFound();
  }

  return <ManageGoalClient goal={data.goal} initialParticipants={data.participants} />;
}
