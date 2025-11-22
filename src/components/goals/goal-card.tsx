
'use client';

import Link from 'next/link';
import { Heart, ChevronsRight, Users, Lock } from 'lucide-react';
import { vaults } from '@/lib/data';

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

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

interface GoalCardProps {
  goal: Goal;
  userVaults: Vault[];
  onToggleFeatured: (goalId: string) => void;
  onGoToVault: (vaultId: string) => void;
}

export function GoalCard({
  goal,
  userVaults,
  onToggleFeatured,
  onGoToVault,
}: GoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  let ownerName = 'Pessoal';
  let ownerVault: Vault | undefined;

  if (goal.ownerType === 'vault') {
    ownerVault = userVaults.find((v) => v.id === goal.ownerId);
    ownerName = ownerVault?.name || 'Cofre Desconhecido';
  }
  
  return (
    <Card
      key={goal.id}
      className="flex h-full flex-col transition-all hover:shadow-md"
    >
      <CardHeader className="flex-row items-start gap-4">
        <Link
          href={`/goals/${goal.id}`}
          className="flex-1 flex items-start gap-4"
        >
          <span className="text-5xl">{goal.emoji}</span>
          <div className="flex-1">
            <CardTitle>{goal.name}</CardTitle>
            <CardDescription>
              <AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /> de{' '}
              {formatCurrency(goal.targetAmount)}
            </CardDescription>
          </div>
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground transition-colors hover:text-[#ff6b7b]"
                onClick={() => onToggleFeatured(goal.id)}
              >
                <Heart
                  className={cn(
                    'h-5 w-5',
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
      </CardHeader>
      <CardContent className="flex-1">
        <Link href={`/goals/${goal.id}`} className="block">
          <Progress value={progress} className="h-3" />
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
                className="inline-block h-6 w-6 rounded-full border-2 border-card"
              >
                <AvatarImage src={p.avatarUrl} alt={p.name} />
                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
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
        {ownerVault ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGoToVault(ownerVault!.id)}
                >
                  <span className="text-xs">{ownerName}</span>
                  <ChevronsRight className="ml-1 h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ir para o cofre {ownerName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
            <span className="text-xs text-muted-foreground">{ownerName}</span>
        )}
      </CardFooter>
    </Card>
  );
}
