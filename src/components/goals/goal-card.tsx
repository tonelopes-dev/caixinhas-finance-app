
'use client';

import Link from 'next/link';
import { Heart, ChevronsRight, Users, Lock, ArrowRight } from 'lucide-react';

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
import { MemberAvatars } from '../ui/member-avatars';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

interface GoalCardProps {
  goal: Goal;
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
        "group relative flex flex-col gap-6 rounded-[28px] bg-[#f6f3f1]/50 border-2 border-transparent p-6 transition-all duration-300 hover:bg-white hover:border-[#ff6b7b]/20 hover:shadow-xl cursor-pointer",
        goal.isFeatured && "border-[#ff6b7b]/10 bg-white/60"
      )}
    >
      <div className="flex items-center gap-5">
        <div className="text-5xl bg-white p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3 flex-shrink-0">
          {goal.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <Link 
                href={`/goals/${goal.id}`}
                className="font-black text-xl truncate tracking-tight text-[#2D241E] hover:text-[#ff6b7b] transition-colors"
              >
                {goal.name}
              </Link>
              {goal.isFeatured && <Heart className="h-4 w-4 text-[#ff6b7b] fill-[#ff6b7b] shrink-0" />}
            </div>
            <p className="text-base font-black text-[#ff6b7b]">
              <AnimatedCounter value={progress} formatter={(v) => Math.round(v).toString()} />%
            </p>
          </div>
          <p className="text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest italic">
            <AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /> de {formatCurrency(goal.targetAmount)}
          </p>
        </div>
        
        <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 text-muted-foreground/30 transition-all duration-300 rounded-full",
                goal.isFeatured ? "text-[#ff6b7b] bg-[#ff6b7b]/5" : "hover:text-[#ff6b7b] hover:bg-[#ff6b7b]/5"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFeatured(goal.id);
              }}
            >
              <Heart className={cn("h-5 w-5", goal.isFeatured && "fill-[#ff6b7b]")} />
            </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative h-4 w-full bg-[#2D241E]/5 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MemberAvatars 
              members={goal.participants?.map(p => ({
                name: p.user.name,
                avatarUrl: p.user.avatarUrl
              })) || []} 
              size="md" 
              limit={3} 
            />
            {goal.participants && goal.participants.length > 0 && (
              <span className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[2px]">Partic.</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#2D241E]/5 text-[10px] font-black text-[#2D241E]/50 uppercase tracking-widest">
              {goal.visibility === 'shared' ? <Users className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              <span>{goal.visibility === 'shared' ? 'Pública' : 'Privada'}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-[#2D241E]/5 bg-white text-[#2D241E]/40 hover:text-primary hover:border-primary/20 transition-all"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onGoToWorkspace(isPersonal ? userId : (vaultId || ''));
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
