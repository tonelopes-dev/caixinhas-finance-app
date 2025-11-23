
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { authOptions } from '@/lib/auth';
import { getGoalManageData } from '@/app/goals/actions';
import { ManageGoalClient } from '@/components/goals/manage-goal-client';
import { VaultService } from '@/services/vault.service';

export default async function ManageGoalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }
  
  const userId = session.user.id;
  const goalId = params.id;

  const cookieStore = cookies();
  const vaultIdCookie = cookieStore.get('CAIXINHAS_VAULT_ID');
  const vaultId = vaultIdCookie?.value;

  let workspaceId = userId;
  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      workspaceId = vaultId;
    }
  }

  const data = await getGoalManageData(goalId, userId, workspaceId);

  if (!data) {
    notFound();
  }

  return <ManageGoalClient goal={data.goal} initialParticipants={data.participants} />;
}
