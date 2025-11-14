

'use server';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getGoalManageData } from '@/app/goals/actions';
import { ManageGoalClient } from '@/components/goals/manage-goal-client';


export default async function ManageGoalPage({ params }: { params: { id: string } }) {
  const data = await getGoalManageData(params.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/goals/${data.goal.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Caixinha
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Gerenciar Caixinha
            </CardTitle>
            <CardDescription>
              Ajuste o nome, ícone, visibilidade, participantes e
              outras opções da sua caixinha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManageGoalClient 
              goal={data.goal}
              currentUser={data.currentUser}
              currentVault={data.currentVault}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

