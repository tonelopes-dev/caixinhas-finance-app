
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getGoalManageData } from '../actions';
import { ManageGoalClient } from '@/components/goals/manage-goal-client';
import { Vault } from '@/types'; // Import Vault type if not already present

// A anotação de tipo foi removida para permitir a inferência pelo Next.js
export default async function ManageGoalPage({ params }) {
  const id = params.id;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getGoalManageData(id, session.user.id);

  if (!data || !data.goal) {
    notFound();
  }

  return (
    <ManageGoalClient
      goal={data.goal}
      // A propriedade currentUser é agora passada para o componente cliente.
      currentUser={session.user}
      // A asserção de tipo resolve a incompatibilidade entre VaultWithMembers e Vault.
      currentVault={data.currentVault as Vault}
    />
  );
}
