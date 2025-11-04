
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMockDataForUser } from '@/lib/data';
import type { Account, Vault, User } from '@/lib/definitions';

import { Button } from '@/components/ui/button';
import { AccountsManagement } from '@/components/profile/accounts-management';
import withAuth from '@/components/auth/with-auth';

function AccountsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userVaults, setUserVaults] = useState<Vault[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [isVaultOwner, setIsVaultOwner] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('DREAMVAULT_USER_ID');
    const selectedWorkspaceId = sessionStorage.getItem('DREAMVAULT_VAULT_ID');

    if (!userId) {
      router.push('/login');
      return;
    }
     if (!selectedWorkspaceId) {
      router.push('/vaults');
      return;
    }

    const { currentUser, userAccounts, userVaults, currentVault } = getMockDataForUser(userId, selectedWorkspaceId);
    
    setCurrentUser(currentUser);
    setAccounts(userAccounts);
    setUserVaults(userVaults);
    setWorkspaceId(selectedWorkspaceId);

    if (currentVault) {
      setWorkspaceName(`cofre "${currentVault.name}"`);
      setIsVaultOwner(currentVault.ownerId === userId);
    } else {
      setWorkspaceName('sua conta pessoal');
      setIsVaultOwner(true); // User is always the owner of their personal space
    }
  }, [router]);

  if (!currentUser || !workspaceId) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

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

export default withAuth(AccountsPage);
