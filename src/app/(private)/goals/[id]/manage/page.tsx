
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { getGoalManageData } from '@/app/(private)/goals/actions';
import { ManageGoalClient } from '@/components/goals/manage-goal-client';

export default async function ManageGoalPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const data = await getGoalManageData(id, session.user.id);

  if (!data) {
    notFound();
  }

  return <ManageGoalClient goal={data.goal} currentUser={data.currentUser} currentVault={data.currentVault} />;
}
