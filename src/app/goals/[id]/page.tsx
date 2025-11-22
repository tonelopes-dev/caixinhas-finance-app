
'use server';

import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoalDetails } from '../actions';
import { GoalDetailClient } from '@/components/goals/goal-detail-client';
import React from 'react';


export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const goalId = params.id;

  const data = await getGoalDetails(goalId, userId);

  if (!data || !data.goal) {
    notFound();
  }

  return (
    <GoalDetailClient
      goal={data.goal}
      transactions={data.transactions}
      accounts={data.accounts as any}
      userId={userId}
    />
  );
}
