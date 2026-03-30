"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Users, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/utils";
import type { Goal, Vault } from "@/lib/definitions";
import { MemberAvatars } from "../ui/member-avatars";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
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
  const router = useRouter();
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  const isPersonal = goal.userId ? true : goal.ownerType === "user";
  const vaultId =
    goal.vaultId || (goal.ownerType === "vault" ? goal.ownerId : undefined);

  let ownerName = "Pessoal";
  let ownerVault: Vault | undefined;

  if (!isPersonal && vaultId) {
    ownerVault = userVaults.find((v) => v.id === vaultId);
    ownerName = ownerVault?.name || "Cofre Desconhecido";
  }

  return (
    <Card
      key={goal.id}
      data-goal-id={goal.id}
      onClick={() => router.push(`/goals/${goal.id}`)}
      className={cn(
        "group relative flex flex-col justify-between rounded-[32px] bg-[#f6f3f1]/80 border-2 border-transparent p-6 transition-all duration-300 hover:bg-white hover:border-[#ff6b7b]/20 hover:shadow-xl cursor-pointer min-h-[260px]",
        goal.isFeatured && "border-[#ff6b7b]/10 bg-white/60",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl bg-white p-3.5 rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 self-start">
          {goal.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/goals/${goal.id}`);
                }}
                className="font-black text-xl tracking-tight text-[#2D241E] hover:text-[#ff6b7b] transition-colors leading-tight cursor-pointer"
              >
                {goal.name}
              </div>
              <p className="text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest italic mt-1.5">
                <AnimatedCounter
                  value={goal.currentAmount}
                  formatter={formatCurrency}
                />{" "}
                de {formatCurrency(goal.targetAmount)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 text-muted-foreground/30 transition-all duration-300 rounded-full bg-white border border-[#2D241E]/5 shadow-sm",
                  goal.isFeatured
                    ? "text-[#ff6b7b] bg-[#ff6b7b]/5"
                    : "hover:text-[#ff6b7b] hover:bg-white",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFeatured(goal.id);
                }}
              >
                <Heart
                  className={cn("h-5 w-5", goal.isFeatured && "fill-[#ff6b7b]")}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-4 flex-1 bg-[#2D241E]/5 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-sm font-black text-[#ff6b7b] shrink-0 min-w-[2.5rem] text-right">
            <AnimatedCounter
              value={progress}
              formatter={(v) => Math.round(v).toString()}
            />
            %
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <MemberAvatars
              members={
                goal.participants?.map((p) => ({
                  name: p.user.name,
                  avatarUrl: p.user.avatarUrl,
                })) || []
              }
              size="md"
              limit={3}
            />
            {goal.participants && goal.participants.length > 0 && (
              <span className="hidden sm:inline text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[2px]">
                Partic.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#2D241E]/5 text-[10px] font-black text-[#2D241E]/50 uppercase tracking-widest min-w-0 max-w-[140px]">
              {isPersonal ? (
                <Lock className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Users className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">
                {ownerName}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full border border-[#2D241E]/5 bg-white text-[#2D241E]/40 hover:text-[#ff6b7b] hover:border-[#ff6b7b]/20 transition-all shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/goals/${goal.id}`);
              }}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
