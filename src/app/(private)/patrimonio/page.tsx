import { redirect } from 'next/navigation';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { getPatrimonyData } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatrimonySection } from '@/components/patrimonio/patrimony-section';
import { AccountRow } from '@/components/patrimonio/account-row';
import { GoalRow } from '@/components/patrimonio/goal-row';
import { CreditCardRow } from '@/components/patrimonio/credit-card-row';
import { motion } from 'framer-motion';
import { withPageAccess } from '@/lib/page-access';

export default async function PatrimonioPage() {
  const { user } = await withPageAccess({ requireFullAccess: true });
  const userId = user.id;

  const { accounts, goals, vaults } = await getPatrimonyData(userId);

  const liquidAssets = accounts.filter(a => ['checking', 'savings'].includes(a.type));
  const investedAccounts = accounts.filter(a => a.type === 'investment');
  const creditCards = accounts.filter(a => a.type === 'credit_card');

  const totalLiquid = liquidAssets.reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvestedAccounts = investedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalInvested = totalInvestedAccounts + totalInGoals;
  
  const grandTotal = totalLiquid + totalInvested;

  return (
    <div className="pb-32 px-4 md:px-8 pt-8 text-[#2D241E]">
      <div className="mx-auto w-full max-w-4xl">
        <StandardBackButton href="/dashboard" label="Voltar para o Dashboard" />

        <div className="relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500 mb-8">
          <div className="p-8 md:p-10 space-y-2 border-b border-[#2D241E]/5 bg-white/30">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b7b] ml-1">Relatório Consolidado</p>
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-[#2D241E] italic">
                Meu <span className="text-[#ff6b7b]">Patrimônio</span> Total
              </h1>
              <p className="text-xs font-medium text-[#2D241E]/40 italic max-w-lg">
                Uma visão consolidada de todos os seus ativos, incluindo contas pessoais e participações em cofres.
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-10">
            <div className="relative p-8 md:p-12 bg-gradient-to-br from-[#ff6b7b]/5 to-[#ff6b7b]/10 rounded-[32px] border border-[#ff6b7b]/10 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden group">
              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff6b7b]/10 rounded-full blur-3xl group-hover:bg-[#ff6b7b]/20 transition-all duration-700" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ff6b7b]/5 rounded-full blur-3xl group-hover:bg-[#ff6b7b]/15 transition-all duration-700" />
              
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 mb-3">Valor Total Acumulado</span>
              <span className="relative z-10 text-5xl md:text-7xl font-bold text-[#2D241E] tracking-tighter drop-shadow-sm">
                {grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <div className="mt-12 space-y-12">
              <PatrimonySection title="Disponível Agora" total={totalLiquid}>
                <div className="grid gap-3">
                  {liquidAssets.length > 0 ? liquidAssets.map(account => (
                    <AccountRow key={account.id} account={account as any} />
                  )) : <p className="text-[#2D241E]/40 text-xs italic px-4 font-medium">Nenhuma conta corrente ou poupança cadastrada.</p>}
                </div>
              </PatrimonySection>

              <PatrimonySection title="Investido p/ Sonhos" total={totalInvested}>
                <div className="grid gap-6">
                  {investedAccounts.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-4">Contas de Investimento</h4>
                      <div className="grid gap-3">
                        {investedAccounts.map(account => (
                          <AccountRow key={account.id} account={account as any} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 ml-4">Caixinhas de Sonhos</h4>
                    <div className="grid gap-3">
                      {goals.length > 0 ? goals.map(goal => (
                        <GoalRow key={goal.id} goal={goal as any} vaults={vaults as any} />
                      )) : <p className="text-[#2D241E]/40 text-xs italic px-4 font-medium">Nenhuma caixinha criada neste espaço.</p>}
                    </div>
                  </div>
                </div>
              </PatrimonySection>

              <PatrimonySection title="Crédito Disponível">
                <div className="grid gap-3">
                  {creditCards.length > 0 ? creditCards.map(card => (
                    <CreditCardRow key={card.id} card={card as any} />
                  )) : <p className="text-[#2D241E]/40 text-xs italic px-4 font-medium">Nenhum cartão de crédito cadastrado.</p>}
                </div>
              </PatrimonySection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
