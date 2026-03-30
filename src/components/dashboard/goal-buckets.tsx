"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  PlusCircle,
  Users,
  Lock,
  Eye,
  EyeOff,
  Heart,
} from "lucide-react";
import type { Goal } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { user, partner } from "@/lib/data";
import { AnimatedCounter } from "../ui/animated-counter";
import { cn } from "@/lib/utils";
import { usePrivacyMode } from "@/hooks/use-privacy-mode";
import { motion } from "framer-motion";
import { MemberAvatars } from "../ui/member-avatars";
import { useLoading } from "@/components/providers/loading-provider";

type GoalBucketsProps = {
  goals: Goal[];
  workspaceName: string;
};

export default function GoalBuckets({
  goals,
  workspaceName,
}: GoalBucketsProps) {
  const { isPrivate, togglePrivacy, isLoaded } = usePrivacyMode();
  const { showLoading } = useLoading();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const goalsToShow = goals.filter(
    (g) => g.isFeatured && g.currentAmount < g.targetAmount,
  );

  const PrivacyBlur = ({
    as: Component = "span",
    className,
  }: {
    as?: React.ElementType;
    className?: string;
  }) => <Component className={className}>R$ ••••••</Component>;
  const PrivacyBlurPercent = () => <span>••%</span>;

  return (
    <Card className="w-full max-w-full border-none bg-white/70 shadow-[0_20px_50px_rgba(45,36,30,0.08)] rounded-[32px] overflow-hidden min-w-0">
      <CardHeader className="p-3.5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="font-headline text-xl sm:text-3xl font-bold tracking-tight text-[#2D241E]">
              Minhas Caixinhas
            </CardTitle>
            <CardDescription className="text-base font-medium text-[#2D241E]/50">
              Seus objetivos favoritos de{" "}
              <span className="font-bold text-[#ff6b7b]">{workspaceName}</span>.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePrivacy}
            aria-label={isPrivate ? "Mostrar valores" : "Ocultar valores"}
            disabled={!isLoaded}
          >
            {isPrivate ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:gap-6 p-3.5 sm:p-6">
        {goalsToShow.map((goal, index) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const participants = goal.participants || [];
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link
                href={`/goals/${goal.id}`}
                onClick={() => showLoading(`Abrindo ${goal.name}...`)}
                className="group relative flex flex-col gap-4 sm:gap-6 rounded-[28px] bg-white border-2 border-transparent p-3.5 sm:p-5 md:p-6 transition-all duration-300 hover:bg-white hover:border-[#ff6b7b]/20 hover:shadow-xl"
              >
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="text-xl sm:text-2xl md:text-5xl bg-white p-2 sm:p-2.5 md:p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 shrink-0">
                    {goal.emoji}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {goal.isFeatured && (
                          <Heart className="h-4 w-4 text-[#ff6b7b] fill-[#ff6b7b] shrink-0" />
                        )}
                        <p className="font-black text-base sm:text-lg md:text-xl truncate tracking-tight text-[#2D241E]">
                          {goal.name}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base font-black text-[#ff6b7b] shrink-0">
                        {!isLoaded || isPrivate ? (
                          <PrivacyBlurPercent />
                        ) : (
                          <>
                            <AnimatedCounter
                              value={progress}
                              formatter={(v) => Math.round(v).toString()}
                            />
                            %
                          </>
                        )}
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest italic truncate">
                      {!isLoaded || isPrivate ? (
                        <PrivacyBlur className="text-muted-foreground/40" />
                      ) : (
                        <>
                          <AnimatedCounter
                            value={goal.currentAmount}
                            formatter={formatCurrency}
                          />{" "}
                          de {formatCurrency(goal.targetAmount)}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative h-4 w-full bg-[#2D241E]/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.5,
                      }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MemberAvatars
                        members={participants.map((p: any) => ({
                          name: p.user?.name || p.name || "Usuário",
                          avatarUrl: p.user?.avatarUrl || p.avatarUrl,
                        }))}
                        size="md"
                        limit={3}
                      />
                      {participants.length > 0 && (
                        <span className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[2px]">
                          Partic.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#2D241E]/5 text-[10px] font-black text-[#2D241E]/50 uppercase tracking-widest max-w-[140px] min-w-0">
                      {workspaceName === "Pessoal" ? (
                        <Lock className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Users className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="truncate">
                        {workspaceName}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
        {goalsToShow.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-[#f6f3f1]/50 rounded-[28px] border-2 border-dashed border-[#2D241E]/10">
            <Heart className="h-10 w-10 text-[#2D241E]/20" />
            <p className="text-lg font-bold text-[#2D241E]/50 max-w-[240px]">
              Nenhuma caixinha favorita ainda. Vamos começar?
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 border-t border-[#2D241E]/5 pt-8 md:flex-row">
        <Button
          variant="outline"
          asChild
          className="flex-1 justify-center rounded-[20px] h-14 font-black border-2 border-[#2D241E]/10 text-[#2D241E] hover:bg-[#2D241E] hover:text-white hover:border-[#2D241E] active:scale-95 transition-all text-xs sm:text-sm md:text-base uppercase tracking-wider group px-2"
        >
          <Link
            href="/goals"
            onClick={() => showLoading("Abrindo Caixinhas...")}
          >
            Ver todas
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button
          className="w-full flex-1 md:w-auto rounded-[20px] h-14 font-black bg-[#ff6b7b] hover:bg-[#fa8292] text-white shadow-lg shadow-[#ff6b7b]/30 active:scale-95 transition-all text-xs sm:text-sm md:text-base uppercase tracking-wider px-2"
          asChild
        >
          <Link
            href="/goals/new"
            onClick={() => showLoading("Nova Caixinha...")}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Criar Caixinha
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
