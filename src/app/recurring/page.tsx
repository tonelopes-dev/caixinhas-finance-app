
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { RecurringPageClient } from '@/components/recurring/recurring-page-client';
import { getRecurringData } from './actions';
import { cookies } from 'next/headers';
import { AccountService } from '@/services/account.service';
import { CategoryService } from '@/services/category.service';
import { getUserAllGoals } from '@/app/(private)/goals/actions';

import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import Header from '@/components/dashboard/header';
import { User } from '@/lib/definitions';

export default async function RecurringPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const cookieStore = await cookies();
  const workspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value || userId;
  const isPersonal = workspaceId === userId;
  const ownerType = isPersonal ? 'user' : 'vault';

  // Fetch all necessary data for the page and its actions
  const [
    recurringData, 
    allAccounts, 
    allGoalsData, 
    allCategories
  ] = await Promise.all([
    getRecurringData(workspaceId, ownerType),
    AccountService.getUserAccounts(userId),
    getUserAllGoals(userId),
    CategoryService.getUserCategories(userId)
  ]);
  const allGoals = allGoalsData.goals;


  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <DashboardBackground />
      
      <div className="relative z-10 flex flex-1 flex-col p-4 md:p-10 pt-24">
        <div className="mx-auto w-full max-w-4xl">
          <Header user={session.user as User} partner={null} />
          <StandardBackButton href="/transactions" label="Voltar para Transações" />
          <RecurringPageClient
            recurringExpenses={recurringData.recurringExpenses}
            recurringIncomes={recurringData.recurringIncomes}
            installmentExpenses={recurringData.installmentExpenses}
            installmentIncomes={recurringData.installmentIncomes}
            allAccounts={allAccounts}
            allGoals={allGoals}
            allCategories={allCategories}
            workspaceId={workspaceId}
          />
        </div>
      </div>
    </div>
  );
}
