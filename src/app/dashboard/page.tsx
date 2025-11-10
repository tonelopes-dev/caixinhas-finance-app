"use server";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDashboardData } from './actions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

  if (!userId) {
    redirect('/login');
  }

  const savedWorkspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value || userId;

  const data = await getDashboardData(userId, savedWorkspaceId);

  if (!data) {
    redirect('/login');
  }

  return <DashboardClient {...data as any} />;
}
