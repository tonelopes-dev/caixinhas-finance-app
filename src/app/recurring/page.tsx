
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecurringPageClient } from '@/components/recurring/recurring-page-client';
import { getRecurringData } from './actions';
import { cookies } from 'next/headers';
import { AccountService, CategoryService, GoalService, VaultService } from '@/services';
import { getUserAllGoals } from '../goals/actions';

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
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Transações
          </Link>
        </Button>
        <RecurringPageClient
          recurring={recurringData.recurring}
          installments={recurringData.installments}
          allAccounts={allAccounts}
          allGoals={allGoals}
          allCategories={allCategories}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}
