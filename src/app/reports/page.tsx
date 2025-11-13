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
import withAuth from '@/components/auth/with-auth';
import type { User } from '@/lib/definitions';
import { ReportGenerator } from '@/components/reports/report-generator';
import { ReportDisplay } from '@/components/reports/report-display';
import { generateNewFinancialReport, type FinancialReportState } from './actions';


function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ value: string, label: string }[]>([]);


  const initialState: FinancialReportState = { reportHtml: null, error: null };
  const [reportState, generateReportAction] = useActionState(generateNewFinancialReport, initialState);

  useEffect(() => {
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    const selectedWorkspaceId = sessionStorage.getItem('CAIXINHAS_VAULT_ID');
    if (userId) {
        const user = users.find(u => u.id === userId) || null;
        setCurrentUser(user);
    }
    if (selectedWorkspaceId) {
        setWorkspaceId(selectedWorkspaceId);

        const relevantTransactions = allTransactions.filter(t => t.ownerId === selectedWorkspaceId);

        if (relevantTransactions.length > 0) {
            const dates = relevantTransactions.map(t => new Date(t.date));
            const years = [...new Set(dates.map(d => d.getFullYear().toString()))].sort((a, b) => b.localeCompare(a));
            setAvailableYears(years);

            const initialYear = years[0] || new Date().getFullYear().toString();
            setYear(initialYear);

            const mostRecentMonth = new Date(Math.max(...dates.map(date => date.getTime()))).getMonth() + 1;
            setMonth(mostRecentMonth.toString());
        } else {
            const currentYearStr = new Date().getFullYear().toString();
            setAvailableYears([currentYearStr]);
            setAvailableMonths(Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }) })));
        }
    }
  }, []);

  useEffect(() => {
    if (!workspaceId || !year) return;

    const relevantTransactions = allTransactions.filter(t => t.ownerId === workspaceId && new Date(t.date).getFullYear().toString() === year);

    if (relevantTransactions.length > 0) {
        const dates = relevantTransactions.map(t => new Date(t.date));
        const monthsSet = new Set(dates.map(d => d.getMonth()));
        const monthsForYear = Array.from(monthsSet).map(m => ({
            value: (m + 1).toString(),
            label: new Date(parseInt(year), m).toLocaleString('pt-BR', { month: 'long' })
        })).sort((a, b) => parseInt(a.value) - parseInt(b.value));
        
        setAvailableMonths(monthsForYear);

        if (!monthsForYear.some(m => m.value === month)) {
            setMonth(monthsForYear[0]?.value || (new Date().getMonth() + 1).toString());
        }

    } else {
        setAvailableMonths([]);
    }
  }, [workspaceId, year, month]);

  useEffect(() => {
    if (reportState?.isNewReport) {
        setReportHtml(reportState.reportHtml ?? null);
    }
    if (reportState?.error) {
        console.error(reportState.error);
    }
  }, [reportState]);

  const handleGenerateReport = (formData: FormData) => {
    setReportHtml(null); // Clear previous report
    generateReportAction(formData);
  }

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
            <ReportGenerator
              workspaceId={workspaceId}
              month={month}
              setMonth={setMonth}
              year={year}
              setYear={setYear}
              availableMonths={availableMonths}
              availableYears={availableYears}
              handleGenerateReport={handleGenerateReport}
            />

            <ReportDisplay
              reportHtml={reportHtml}
              isLoading={reportState.pending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ReportsPage);
