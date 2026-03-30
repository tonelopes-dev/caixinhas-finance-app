
'use server';

import { generateFinancialReport } from '@/ai/flows/financial-report-flow';
import { ReportService } from '@/services/ReportService';
import { z } from 'zod';

const generateReportSchema = z.object({
    month: z.string().min(1, 'Mês é obrigatório'),
    year: z.string().min(1, 'Ano é obrigatório'),
    ownerId: z.string().min(1, 'Workspace ID é obrigatório'),
    forceRegenerate: z.string().nullable().optional(), // Para forçar regeneração
});

export type FinancialReportState = {
  reportHtml?: string | null;
  isNewReport?: boolean;
  error?: string | null;
};

export async function generateNewFinancialReport(_prevState: FinancialReportState, formData: FormData): Promise<FinancialReportState> {
    console.log('📊 Dados do formulário:', { 
        month: formData.get('month'),
        year: formData.get('year'),
        ownerId: formData.get('ownerId'),
        forceRegenerate: formData.get('forceRegenerate')
    });
    
    const validatedFields = generateReportSchema.safeParse({
        month: formData.get('month'),
        year: formData.get('year'),
        ownerId: formData.get('ownerId'),
        forceRegenerate: formData.get('forceRegenerate'),
    });

    if (!validatedFields.success) {
        console.error('❌ Validação falhou:', validatedFields.error.format());
        return { error: 'Dados inválidos para gerar o relatório. Verifique se o mês e ano foram selecionados.' };
    }

    const { month, year, ownerId, forceRegenerate } = validatedFields.data;
    
    const monthIndex = parseInt(month, 10) - 1;
    const yearNum = parseInt(year, 10);
    const monthName = new Date(yearNum, monthIndex).toLocaleString('pt-BR', { month: 'long' });
    const monthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${yearNum}`;
    
    // Verifica se já existe relatório salvo no banco
    // Se forceRegenerate estiver definido (botão "Atualizar"), pula o cache
    const cachedReport = forceRegenerate ? null : await ReportService.getReport(ownerId, monthYear);
    if (cachedReport) {
        return {
            reportHtml: cachedReport.analysisHtml,
            isNewReport: true,
        };
    }

    const relevantTransactions = await ReportService.getTransactionsForPeriod(
        ownerId, 
        parseInt(month, 10), 
        yearNum
    );

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

        // Salva o relatório no banco de dados com a contagem de transações
        const savedReport = await ReportService.saveReport({
            ownerId,
            monthYear,
            analysisHtml: result.analysisHtml,
            transactionCount: relevantTransactions.length
        });

        if (!savedReport) {
            console.warn('Falha ao salvar relatório no banco, mas continuando...');
        }

        return {
            reportHtml: result.analysisHtml,
            isNewReport: true,
        };
    } catch (error: any) {
        console.error('Error generating financial report:', error);
        
        // Mensagens de erro específicas para melhor UX
        if (error.code === 503) {
            return { error: 'O serviço de IA está temporariamente sobrecarregado. Tente novamente em alguns minutos.' };
        } else if (error.code === 429) {
            return { error: 'Muitas solicitações. Aguarde um momento antes de tentar novamente.' };
        } else if (error.message?.includes('quota')) {
            return { error: 'Cota da IA excedida. Tente novamente mais tarde ou entre em contato com o suporte.' };
        } else {
            return { error: 'Erro temporário ao gerar o relatório. Tente novamente em alguns instantes.' };
        }
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

export type ReportActionResult = {
  success: boolean;
  data?: any;
  message?: string;
};

/**
 * Verifica se o usuário tem alguma transação
 */
export async function checkHasAnyTransactionsAction(workspaceId: string): Promise<ReportActionResult> {
  try {
    const hasTransactions = await ReportService.hasAnyTransactions(workspaceId);
    return { success: true, data: hasTransactions };
  } catch (error) {
    console.error('Erro ao verificar transações:', error);
    return { success: false, message: 'Erro ao verificar transações' };
  }
}

/**
 * Busca meses que têm transações
 */
export async function getMonthsWithTransactionsAction(workspaceId: string): Promise<ReportActionResult> {
  try {
    const months = await ReportService.getMonthsWithTransactions(workspaceId);
    return { success: true, data: months };
  } catch (error) {
    console.error('Erro ao buscar meses com transações:', error);
    return { success: false, message: 'Erro ao buscar meses com transações' };
  }
}

/**
 * Verifica o status de um relatório
 */
export async function getReportStatusAction(workspaceId: string, monthLabel: string): Promise<ReportActionResult> {
  try {
    const status = await ReportService.getReportStatus(workspaceId, monthLabel);
    return { success: true, data: status };
  } catch (error) {
    console.error('Erro ao verificar status do relatório:', error);
    return { success: false, message: 'Erro ao verificar status do relatório' };
  }
}
