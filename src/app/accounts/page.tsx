
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAccountsData } from './actions';

import { Button } from '@/components/ui/button';
import { AccountsManagement } from '@/components/profile/accounts-management';

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  // A lógica do workspaceId é menos relevante aqui agora, mas mantemos para consistência do nome
  const workspaceId = userId;
  const workspaceName = "seu"; // Simplificado, já que a página agora mostra todas as contas

  const { accounts, currentUser, userVaults } = await getAccountsData(userId);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <AccountsManagement
          accounts={accounts}
          currentUserId={currentUser.id}
          userVaults={userVaults}
          workspaceId={workspaceId} // Ainda pode ser útil para saber o contexto atual
          workspaceName={workspaceName}
          isVaultOwner={true} // Simplificado, o usuário sempre é "dono" do seu gerenciamento
        />
      </div>
    </div>
  );
}
