'use client';

import { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { users, transactions as allTransactions } from '@/lib/data';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/definitions';
import { ReportGenerator } from '@/components/reports/report-generator';
import { ReportDisplay } from '@/components/reports/report-display';
import { ReportLoadingProgress } from '@/components/reports/report-loading-progress';
import { generateNewFinancialReport, type FinancialReportState } from './actions';
import { checkHasAnyTransactionsAction, getMonthsWithTransactionsAction, getReportStatusAction } from './actions';

function ReportsPage() {
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
        const uniqueYears = [...new Set(monthsWithTransactions.map(m => m.year.toString()))];
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
      // Encontra o mês selecionado nos meses disponíveis
      const selectedMonth = availableMonths.find(m => m.value === month && m.year.toString() === year);
      if (!selectedMonth) return;
      
      const statusResult = await getReportStatusAction(workspaceId, selectedMonth.label);
      if (!statusResult.success) {
        console.error('Erro ao verificar status:', statusResult.message);
        return;
      }
      const status = statusResult.data;
      setReportStatus(status);
      
      // Se existe relatório e não está desatualizado, exibe o HTML salvo
      if (status.exists && !status.isOutdated && status.report) {
        setReportHtml(status.report.analysisHtml);
      } else {
        setReportHtml(null);
      }
    };
    
    checkReportStatus();
  }, [workspaceId, month, year, availableMonths]);

  useEffect(() => {
    if (reportState?.isNewReport) {
        setReportHtml(reportState.reportHtml ?? null);
        setIsGenerating(false);
    }
    if (reportState?.error) {
        console.error(reportState.error);
        setIsGenerating(false);
    }
  }, [reportState]);

  const handleGenerateReport = (formData: FormData) => {
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
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              Relatórios Financeiros Sob Demanda
            </CardTitle>
            <CardDescription>
              Selecione um período e gere uma análise de saúde financeira profissional com nossa IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasAnyTransactions === false ? (
              // Regra 1: Sem transações - esconder componente e mostrar mensagem
              <div className="text-center py-10">
                <p className="text-muted-foreground text-lg">
                  Assim que houver alguma transação registrada, esta função será liberada.
                </p>
              </div>
            ) : hasAnyTransactions === true ? (
              // Tem transações - mostrar interface completa
              <>
                {/* Se está gerando, mostra apenas o loading. Senão, mostra a interface normal */}
                {isGenerating ? (
                  <ReportLoadingProgress isVisible={true} />
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
              </>
            ) : (
              // Carregando verificação de transações
              <div className="text-center py-10">
                <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground mt-4">Verificando transações...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;