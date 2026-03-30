
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getUserAllGoals } from '@/app/(private)/goals/actions';
import { TransactionsPageClient } from '@/components/transactions/transactions-page-client';
import { authOptions } from '@/lib/auth';
import { AccountService } from '@/services/account.service';
import { CategoryService } from '@/services/category.service';
import { TransactionService } from '@/services/transaction.service';
import { VaultService } from '@/services/vault.service';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const { 
    page = '1', 
    q: search, 
    type = 'all', 
    month = 'all', 
    year = 'all' 
  } = (await searchParams) as { [key: string]: string };

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

  // Buscar todos os dados registrados no servidor com paginação e filtros
  const [
    { transactions, total }, 
    accounts, 
    goalsData,
    categories 
  ] = await Promise.all([
    TransactionService.getTransactions(workspaceId, ownerType, {
      page: parseInt(page),
      limit: 10,
      search,
      type: type as any,
      month,
      year
    }),
    AccountService.getUserAccounts(userId),
    getUserAllGoals(userId),
    CategoryService.getUserCategories(userId),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8 pb-12 pt-8">
      <TransactionsPageClient
        initialTransactions={transactions}
        totalTransactions={total}
        currentPage={parseInt(page)}
        allAccounts={accounts}
        allGoals={goalsData.goals}
        allCategories={categories}
        workspaceId={workspaceId}
      />
    </div>
  );
}
