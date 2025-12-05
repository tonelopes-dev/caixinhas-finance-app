
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { TransactionsPageClient } from '@/components/transactions/transactions-page-client';
import { AccountService } from '@/services/account.service';
import { CategoryService } from '@/services/category.service';
import { TransactionService } from '@/services/transaction.service';
import { VaultService } from '@/services/vault.service';
import { getUserAllGoals } from '@/app/(private)/goals/actions';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  
  const cookieStore = await cookies();
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  let workspaceId = userId;
  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      workspaceId = vaultId;
    }
  }

  const isPersonal = workspaceId === userId;
  const ownerType = isPersonal ? 'user' : 'vault';

  // Buscar todos os dados necessários no servidor
  const [
    transactions, 
    accounts, 
    goalsData,
    categories 
  ] = await Promise.all([
    TransactionService.getTransactions(workspaceId, ownerType),
    AccountService.getUserAccounts(userId),
    getUserAllGoals(userId),
    CategoryService.getUserCategories(userId),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-6xl">
        <BackToDashboard className="mb-4" />

        <TransactionsPageClient
          initialTransactions={transactions}
          allAccounts={accounts}
          allGoals={goalsData.goals}
          allCategories={categories}
          workspaceId={workspaceId}
          userVaults={goalsData.vaults}
        />
      </div>
    </div>
  );
}
