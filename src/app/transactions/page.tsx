
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { TransactionsPageClient } from '@/components/transactions/transactions-page-client';
import { AccountService } from '@/services/account.service';
import { CategoryService } from '@/services/category.service';
import { TransactionService } from '@/services/transaction.service';
import { VaultService } from '@/services/vault.service';
import { getUserAllGoals } from '@/app/goals/actions';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  // TODO: Pegar o workspaceId do cookie quando implementado
  const workspaceId = userId; 
  const isPersonal = workspaceId === userId;
  const ownerType = isPersonal ? 'user' : 'vault';

  // Buscar todos os dados necessários no servidor
  const [
    transactions, 
    accounts, 
    goals, 
    categories, 
    userVaults
  ] = await Promise.all([
    TransactionService.getTransactions(workspaceId, ownerType),
    AccountService.getUserAccounts(userId), // Todas as contas do usuário
    getUserAllGoals(userId).then(data => data.goals), // Todas as metas do usuário
    CategoryService.getUserCategories(userId),
    VaultService.getUserVaults(userId)
  ]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-6xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>

        <TransactionsPageClient
          initialTransactions={transactions}
          allAccounts={accounts}
          allGoals={goals as any[]}
          allCategories={categories}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}
