'use client';

import { useState, useEffect, useActionState } from 'react';
import { FileText, Clock } from 'lucide-react';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/definitions';
import { ReportGenerator } from '@/components/reports/report-generator';
import { ReportDisplay } from '@/components/reports/report-display';
import { ReportLoadingProgress } from '@/components/reports/report-loading-progress';
import { generateNewFinancialReport, type FinancialReportState } from '@/app/(private)/reports/actions';
import { checkHasAnyTransactionsAction, getMonthsWithTransactionsAction, getReportStatusAction } from '@/app/(private)/reports/actions';

export function ReportsPageClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ value: string, label: string, year: number }[]>([]);
  
  // Novos estados para as regras refinadas
  const [hasAnyTransactions, setHasAnyTransactions] = useState<boolean | null>(null);
  const [reportStatus, setReportStatus] = useState<{
    exists: boolean;
    isOutdated: boolean;
    buttonLabel: string;
    buttonEnabled: boolean;
  }>({ exists: false, isOutdated: false, buttonLabel: 'Gerar Relatório', buttonEnabled: true });

  const initialState: FinancialReportState = { reportHtml: null, error: null };
  const [reportState, generateReportAction] = useActionState(generateNewFinancialReport, initialState);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const userId = session.user.id;
    const selectedWorkspaceId = sessionStorage.getItem('CAIXINHAS_VAULT_ID') || userId;
    
    // Use NextAuth session data directly
    const user: User = {
      id: session.user.id,
      name: session.user.name || 'Usuário',
      email: session.user.email || '',
      avatarUrl: session.user.image || '',
      subscriptionStatus: 'active'
    };
    setCurrentUser(user);
    setWorkspaceId(selectedWorkspaceId);

    // Verifica se o usuário tem alguma transação
    const checkTransactions = async () => {
      const hasTransactionsResult = await checkHasAnyTransactionsAction(selectedWorkspaceId);
      if (!hasTransactionsResult.success) {
        console.error('Erro ao verificar transações:', hasTransactionsResult.message);
        return;
      }
      
      const hasTransactions = hasTransactionsResult.data;
      setHasAnyTransactions(hasTransactions);
      
      if (hasTransactions) {
        // Busca meses que realmente têm transações
        const monthsResult = await getMonthsWithTransactionsAction(selectedWorkspaceId);
        if (!monthsResult.success) {
          console.error('Erro ao buscar meses:', monthsResult.message);
          return;
        }
        const monthsWithTransactions = monthsResult.data;
        setAvailableMonths(monthsWithTransactions);
        
        // Extrai anos únicos dos meses disponíveis
        const uniqueYears = Array.from(new Set(monthsWithTransactions.map((m: { year: number }) => m.year.toString()))) as string[];
        setAvailableYears(uniqueYears.sort((a, b) => b.localeCompare(a)));
        
        // Define mês e ano inicial (mais recente)
        if (monthsWithTransactions.length > 0) {
          const mostRecent = monthsWithTransactions[0];
          setMonth(mostRecent.value);
          setYear(mostRecent.year.toString());
        }
      }
    };
    
    checkTransactions();
  }, [session, status, router]);

  // useEffect para verificar status do relatório quando mês/ano mudam
  useEffect(() => {
    if (!workspaceId || !month || !year) return;

    const checkReportStatus = async () => {
      // Constrói o monthYear diretamente sem depender de availableMonths
      const monthIndex = parseInt(month, 10) - 1;
      const yearNum = parseInt(year, 10);
      const monthName = new Date(yearNum, monthIndex).toLocaleString('pt-BR', { month: 'long' });
      const monthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${yearNum}`;
      
      const statusResult = await getReportStatusAction(workspaceId, monthYear);
      if (!statusResult.success) {
        console.error('Erro ao verificar status:', statusResult.message);
        return;
      }
      const status = statusResult.data;
      setReportStatus(status);
      
      // Se houver relatório, o botão deve continuar habilitado para permitir regeneração manual
      if (status.exists) {
        setReportStatus(prev => ({ ...prev, buttonEnabled: true }));
      }
      
      // Se existe relatório (mesmo desatualizado), exibe o HTML salvo
      // O botão "Atualizar Relatório" ficará disponível se estiver desatualizado
      if (status.exists && status.report) {
        setReportHtml(status.report.analysisHtml);
      } else {
        setReportHtml(null);
      }
    };
    
    checkReportStatus();
  }, [workspaceId, month, year]);

  useEffect(() => {
    if (reportState?.isNewReport) {
        setReportHtml(reportState.reportHtml ?? null);
        setIsGenerating(false);
        
        // Recarrega o status do relatório após gerar um novo
        const reloadStatus = async () => {
          if (!workspaceId || !month || !year) return;
          
          const monthIndex = parseInt(month, 10) - 1;
          const yearNum = parseInt(year, 10);
          const monthName = new Date(yearNum, monthIndex).toLocaleString('pt-BR', { month: 'long' });
          const monthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${yearNum}`;
          
          const statusResult = await getReportStatusAction(workspaceId, monthYear);
          if (statusResult.success) {
            setReportStatus(statusResult.data);
          }
        };
        
        reloadStatus();
    }
    if (reportState?.error) {
        console.error(reportState.error);
        setIsGenerating(false);
    }
  }, [reportState, workspaceId, month, year]);

  const handleGenerateReport = (formData: FormData) => {
    console.log('📊 Gerando relatório - month:', month, 'year:', year, 'workspaceId:', workspaceId);
    
    // Validação antes de enviar
    if (!month || !year || !workspaceId) {
      console.error('❌ Dados faltando:', { month, year, workspaceId });
      return;
    }
    
    // Se o relatório está desatualizado, força regeneração
    if (reportStatus.isOutdated) {
      formData.append('forceRegenerate', 'true');
    }
    
    // Só limpa o HTML se for gerar um novo relatório
    if (reportStatus.isOutdated || !reportStatus.exists) {
      setReportHtml(null);
    }
    setIsGenerating(true);
    generateReportAction(formData);
  };

  if (!currentUser || !workspaceId) {
    return <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-20 pt-24">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-14">
          <div className="space-y-4">
            <StandardBackButton href="/dashboard" label="Voltar ao Dashboard" />
            <div>
              <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight text-[#2D241E] italic">
                  Relatórios <span className="text-[#ff6b7b] animate-pulse-slow">Financeiros</span>
              </h1>
              <p className="text-[#2D241E]/40 font-bold text-base md:text-lg mt-2 italic ml-1">
                  Análise profissional de sua saúde financeira gerada por IA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
            {hasAnyTransactions === false ? (
              <div className="flex-1 flex items-center justify-center p-6 sm:p-20 text-center">
                <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] p-10 sm:p-20 w-full max-w-3xl">
                  <div className="mb-8 p-6 sm:p-10 bg-white/30 w-fit mx-auto rounded-[34px] sm:rounded-[48px] border border-white/50">
                    <div className="text-5xl sm:text-7xl">📈</div>
                  </div>
                  <h3 className="font-headline text-2xl sm:text-3xl font-black text-[#2D241E] tracking-tight mb-4 italic">Comece registrando transações</h3>
                  <p className="text-xs sm:text-sm font-bold text-[#2D241E]/40 max-w-xl mx-auto uppercase tracking-widest leading-relaxed">
                    Assim que houver transações registradas, nossa IA poderá gerar relatórios financeiros detalhados para você.
                  </p>
                </div>
              </div>
            ) : hasAnyTransactions === true ? (
              <div className="flex-1 flex flex-col space-y-8 md:space-y-12">
                {/* Advisory Notice */}
                <div className="p-6 rounded-[32px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm flex items-start sm:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="h-12 w-12 rounded-2xl bg-[#ff6b7b]/10 flex items-center justify-center shrink-0 border border-[#ff6b7b]/20">
                    <Clock className="h-6 w-6 text-[#ff6b7b]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-[#2D241E] uppercase tracking-wider italic">
                      Nota sobre o <span className="text-[#ff6b7b]">Processamento</span>
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#2D241E]/50 leading-relaxed max-w-3xl italic">
                      A geração do relatório por nossa IA pode levar até <span className="text-[#ff6b7b]">5 minutos</span> para uma análise completa. 
                      Você pode continuar navegando pelo app tranquilamente; o relatório ficará salvo automaticamente assim que estiver pronto.
                    </p>
                  </div>
                </div>

                {isGenerating ? (
                  <div className="flex-1 flex items-center justify-center p-6 sm:p-20 text-center">
                    <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] p-10 sm:p-20 w-full max-w-3xl">
                      <ReportLoadingProgress isVisible={true} />
                    </div>
                  </div>
                ) : (
                  <>
                    <ReportGenerator
                      workspaceId={workspaceId}
                      month={month}
                      setMonth={setMonth}
                      year={year}
                      setYear={setYear}
                      availableMonths={availableMonths}
                      availableYears={availableYears}
                      handleGenerateReport={handleGenerateReport}
                      buttonLabel={reportStatus.buttonLabel}
                      buttonEnabled={reportStatus.buttonEnabled}
                      isGenerating={false}
                    />
    
                    <ReportDisplay
                      reportHtml={reportHtml}
                      isLoading={false}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 sm:p-20 text-center">
                <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] p-10 sm:p-20 w-full max-w-3xl">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 mx-auto animate-spin rounded-full border-4 border-[#ff6b7b] border-t-transparent" />
                  <p className="text-[10px] sm:text-[11px] font-black text-[#2D241E]/40 mt-8 uppercase tracking-[0.25em]">Sincronizando seus dados...</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
