
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAccountsData } from './actions';

import { Button } from '@/components/ui/button';
import { AccountsManagement } from '@/components/profile/accounts-management';

export default async function AccountsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
  const selectedWorkspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  if (!userId) {
    redirect('/login');
  }

  if (!selectedWorkspaceId) {
    redirect('/vaults');
  }

  const { accounts, currentUser, userVaults, workspaceId, workspaceName, isVaultOwner } = await getAccountsData(userId);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <AccountsManagement
          accounts={accounts}
          currentUserId={currentUser.id}
          userVaults={userVaults}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          isVaultOwner={isVaultOwner}
        />
      </div>
    </div>
  );
}
