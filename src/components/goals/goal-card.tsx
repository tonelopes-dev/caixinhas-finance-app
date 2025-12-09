
'use client';

import Link from 'next/link';
import { Heart, ChevronsRight, Users, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Goal, Vault } from '@/lib/definitions';

// Estendendo o tipo Goal para incluir os campos do Prisma que podem estar faltando na definição global
type ExtendedGoal = Goal & {
  userId?: string | null;
  vaultId?: string | null;
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

interface GoalCardProps {
  goal: ExtendedGoal;
  userVaults: Vault[];
  userId: string;
  onToggleFeatured: (goalId: string) => void;
  onGoToWorkspace: (workspaceId: string) => void;
}

export function GoalCard({
  goal,
  userVaults,
  userId,
  onToggleFeatured,
  onGoToWorkspace,
}: GoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  
  // Lógica corrigida para determinar o proprietário
  // Prioriza userId/vaultId se existirem (vindos do Prisma), senão tenta usar ownerType/ownerId
  const isPersonal = goal.userId ? true : (goal.ownerType === 'user');
  const vaultId = goal.vaultId || (goal.ownerType === 'vault' ? goal.ownerId : undefined);
  
  let ownerName = 'Pessoal';
  let ownerVault: Vault | undefined;

  if (!isPersonal && vaultId) {
    ownerVault = userVaults.find((v) => v.id === vaultId);
    ownerName = ownerVault?.name || 'Cofre Desconhecido';
  }
  
  return (
    <Card
      key={goal.id}
      data-goal-id={goal.id}
      className={cn(
        "group flex h-full flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        progress >= 100 ? 'ring-2 ring-green-200 dark:ring-green-800 bg-green-50/50 dark:bg-green-900/10' : '',
        goal.isFeatured ? 'ring-2 ring-amber-200 dark:ring-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : ''
      )}
    >
      <CardHeader className="flex-row items-start gap-4">
        <Link
          href={`/goals/${goal.id}`}
          className="flex-1 flex items-start gap-4 group-hover:scale-[1.01] transition-transform duration-200"
        >
          <span className="text-5xl transition-transform duration-300 group-hover:scale-110">{goal.emoji}</span>
          <div className="flex-1">
            <CardTitle>{goal.name}</CardTitle>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-600">
              {isPersonal ? 'Caixinha Pessoal' : `Cofre: ${ownerName}`}
            </p>
            <CardDescription className="pt-1">
              <AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /> de{' '}
              {formatCurrency(goal.targetAmount)}
            </CardDescription>
          </div>
        </Link>
        {goal.visibility === 'private' ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-8 w-8 items-center justify-center text-muted-foreground/50 cursor-help">
                  <Lock className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Caixinhas privadas não aparecem nos destaques da página inicial.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground transition-all duration-300 hover:text-[#ff6b7b] hover:scale-110 active:scale-95"
                  onClick={() => onToggleFeatured(goal.id)}
                >
                  <Heart
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      goal.isFeatured && 'fill-[#ff6b7b] text-[#ff6b7b]'
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {goal.isFeatured ? 'Remover dos favoritos' : 'Favoritar no painel'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <Link href={`/goals/${goal.id}`} className="block">
          <div className="relative">
            <Progress value={progress} className="h-3 transition-all duration-700 ease-out" />
            {progress >= 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              {goal.visibility === 'shared' ? (
                <Users className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>
                {goal.visibility === 'shared' ? 'Compartilhada' : 'Privada'}
              </span>
            </div>
            <p className="font-bold text-primary flex items-center gap-1">
              <AnimatedCounter
                value={progress}
                formatter={(v) => Math.round(v).toString()}
              />
              %
            </p>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {goal.participants?.slice(0, 5).map((p, index) => (
              <Avatar
                key={p.id ?? index}
                className="inline-block h-6 w-6 rounded-full border-2 border-card transition-transform duration-300 hover:scale-110 hover:z-10"
              >
                <AvatarImage src={p.avatarUrl} alt={p.name || 'Usuário'} />
                <AvatarFallback>{(p.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
            {goal.participants && goal.participants.length > 5 && (
              <Avatar className="inline-block h-6 w-6 rounded-full border-2 border-card">
                <AvatarFallback>+{goal.participants.length - 5}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {goal.participants && goal.participants.length > 1
              ? `${goal.participants.length} participantes`
              : 'Apenas você'}
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => onGoToWorkspace(isPersonal ? userId : (ownerVault?.id || vaultId || ''))}
                disabled={!isPersonal && !ownerVault}
              >
                <span className="text-xs">{ownerName}</span>
                <ChevronsRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ir para o {isPersonal ? 'espaço pessoal' : `cofre ${ownerName}`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
