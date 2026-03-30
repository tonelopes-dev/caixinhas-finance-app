"use client";

import { useLoading } from "@/components/providers/loading-provider";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { usePrivacyMode } from "@/hooks/use-privacy-mode";
import { Eye, EyeOff, PiggyBank, Wallet } from "lucide-react";
import Link from "next/link";
import { AnimatedCounter } from "../ui/animated-counter";

type NetWorthSummaryProps = {
  liquidAssets: number;
  investedAssets: number;
};

export default function NetWorthSummary({
  liquidAssets,
  investedAssets,
}: NetWorthSummaryProps) {
  const { isPrivate, togglePrivacy, isLoaded } = usePrivacyMode();
  const totalNetWorth = liquidAssets + investedAssets;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const PrivacyBlur = () => (
    <span className="text-xl sm:text-3xl font-black tracking-tighter text-[#2D241E]/30">
      R$ ••••••
    </span>
  );
  const PrivacyBlurPrimary = () => (
    <span className="text-2xl sm:text-4xl font-black text-[#ff6b7b]/30 tracking-tighter">
      R$ ••••••
    </span>
  );

  const { showLoading } = useLoading();

  return (
    <Card className="w-full max-w-full border-none bg-white shadow-[0_20px_50px_rgba(45,36,30,0.08)] rounded-[32px] overflow-hidden min-w-0">
      <CardHeader className="p-3.5 sm:p-6 pb-2 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="font-headline text-xl sm:text-3xl font-bold tracking-tight text-[#2D241E] truncate">
              Meu Patrimônio
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-base font-medium text-[#2D241E]/50 leading-tight">
              Todo o seu dinheiro somado em um só lugar.
            </CardDescription>
          </div>
          <button
            onClick={togglePrivacy}
            className="p-2 sm:p-2.5 rounded-xl hover:bg-[#2D241E]/5 transition-colors shrink-0"
          >
            {isPrivate ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#2D241E]/40" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#2D241E]/40" />
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-0 sm:pt-0 pb-3 sm:pb-6">
        <Link
          href="/patrimonio"
          onClick={() => showLoading("Calculando Patrimônio...")}
          className="relative group block w-full min-w-0 rounded-3xl bg-[#f6f3f1] p-3.5 sm:p-8 transition-all duration-300 hover:shadow-inner border border-[#2D241E]/5 mb-4 sm:mb-8 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 w-full min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-sm font-bold tracking-widest text-[#ff6b7b] uppercase">
                Patrimônio Total
              </p>
              <p className="text-xs text-[#2D241E]/40 font-bold uppercase">
                Clique para ver detalhes
              </p>
            </div>
            <div className="text-2xl sm:text-5xl font-bold tracking-tighter text-[#2D241E]">
              {!isLoaded || isPrivate ? (
                <PrivacyBlurPrimary />
              ) : (
                <AnimatedCounter
                  value={totalNetWorth}
                  formatter={formatCurrency}
                />
              )}
            </div>
          </div>
        </Link>

        <div className="grid gap-4 md:grid-cols-2 w-full min-w-0">
          {/* Dinheiro na Mão Card */}
          <div className="relative group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 rounded-[28px] bg-white border-2 border-[#f6f3f1] p-3.5 sm:p-5 md:p-6 transition-all duration-300 hover:border-[#ff6b7b]/20 hover:shadow-lg overflow-hidden w-full min-w-0">
            <div className="flex items-center gap-3 md:contents w-full min-w-0">
              <div className="rounded-2xl bg-blue-50 p-2.5 sm:p-3 md:p-5 shrink-0 transition-transform group-hover:scale-110">
                <Wallet className="h-6 w-6 md:h-10 md:w-10 text-blue-600" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-[#2D241E]/40 uppercase tracking-widest italic truncate flex-1 md:hidden">
                dinheiro na mão
              </p>
            </div>
            
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-xs md:text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest italic truncate hidden md:block">
                dinheiro na mão
              </p>
              {!isLoaded || isPrivate ? (
                <PrivacyBlur />
              ) : (
                <p className="text-xl sm:text-3xl font-bold tracking-tighter text-[#2D241E] truncate">
                  <AnimatedCounter
                    value={liquidAssets}
                    formatter={formatCurrency}
                  />
                </p>
              )}
            </div>
          </div>

          {/* Nas Caixinhas Card */}
          <div className="relative group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 rounded-[28px] bg-white border-2 border-[#f6f3f1] p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-[#456534]/20 hover:shadow-lg">
            <div className="flex items-center gap-3 md:contents">
              <div className="rounded-2xl bg-emerald-50 p-2.5 sm:p-3 md:p-5 shrink-0 transition-transform group-hover:scale-110">
                <PiggyBank
                  className="h-6 w-6 md:h-10 md:w-10 text-emerald-600"
                  strokeWidth={2.5}
                />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-[#2D241E]/40 uppercase tracking-widest italic truncate flex-1 md:hidden">
                nas caixinhas
              </p>
            </div>
            
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-xs md:text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest italic truncate hidden md:block">
                nas caixinhas
              </p>
              {!isLoaded || isPrivate ? (
                <PrivacyBlur />
              ) : (
                <p className="text-xl sm:text-3xl font-bold tracking-tighter text-[#2D241E] truncate">
                  <AnimatedCounter
                    value={investedAssets}
                    formatter={formatCurrency}
                  />
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
