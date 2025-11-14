
'use server';

import { z } from 'zod';
import { generateFinancialReport } from '@/ai/flows/financial-report-flow';
import { transactions } from '@/lib/data';
import { ReportService } from '@/services/ReportService';

const generateReportSchema = z.object({
    month: z.string(),
    year: z.string(),
    ownerId: z.string(),
});

export type FinancialReportState = {
  reportHtml?: string | null;
  isNewReport?: boolean;
  error?: string | null;
};

export async function generateNewFinancialReport(prevState: FinancialReportState, formData: FormData): Promise<FinancialReportState> {
    const validatedFields = generateReportSchema.safeParse({
        month: formData.get('month'),
        year: formData.get('year'),
        ownerId: formData.get('ownerId'),
    });

    if (!validatedFields.success) {
        return { error: 'Dados inválidos para gerar o relatório.' };
    }

    const { month, year, ownerId } = validatedFields.data;
    
    const monthIndex = parseInt(month, 10) - 1;
    const yearNum = parseInt(year, 10);
    const monthName = new Date(yearNum, monthIndex).toLocaleString('pt-BR', { month: 'long' });
    const monthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${yearNum}`;
    
    // Verifica se já existe relatório salvo no banco
    const cachedReport = await ReportService.getReport(ownerId, monthYear);
    if (cachedReport) {
        return {
            reportHtml: cachedReport.analysisHtml,
            isNewReport: true,
        };
    }

    const relevantTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.ownerId === ownerId && transactionDate.getMonth() === monthIndex && transactionDate.getFullYear() === yearNum;
    });

    if (relevantTransactions.length === 0) {
        const noDataHtml = `<div class="text-center py-10"><p class="text-muted-foreground">Nenhuma transação encontrada para ${monthYear}.</p></div>`;
        return {
             reportHtml: noDataHtml,
             isNewReport: true
        };
    }

    try {
        const result = await generateFinancialReport({
            month: monthYear,
            transactions: JSON.stringify(relevantTransactions, null, 2),
        });

        // Salva o relatório no banco de dados
        const savedReport = await ReportService.saveReport({
            ownerId,
            monthYear,
            analysisHtml: result.analysisHtml
        });

        if (!savedReport) {
            console.warn('Falha ao salvar relatório no banco, mas continuando...');
        }

        return {
            reportHtml: result.analysisHtml,
            isNewReport: true,
        };
    } catch (error) {
        console.error('Error generating financial report:', error);
        return { error: 'Ocorreu um erro ao gerar o relatório. Tente novamente.' };
    }
}

export async function invalidateReportCache(date: string | undefined, ownerId: string | undefined) {
    if (!date || !ownerId) return;

    const transactionDate = new Date(date);
    const month = transactionDate.getMonth();
    const year = transactionDate.getFullYear();
    const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long' });
    const monthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
    
    const deleted = await ReportService.deleteReport(ownerId, monthYear);
    if (deleted) {
        console.log(`Cache for report ${ownerId}-${monthYear} invalidated.`);
    }
}
