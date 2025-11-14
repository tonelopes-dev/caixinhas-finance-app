import { ReportService } from '@/services/ReportService';

/**
 * Limpa relatórios antigos automaticamente
 * Deve ser executado periodicamente (cron job, etc.)
 */
export async function cleanupOldReports() {
  try {
    console.log('🧹 Iniciando limpeza de relatórios antigos...');
    
    // Remove relatórios com mais de 90 dias
    const deletedCount = await ReportService.cleanOldReports(90);
    
    console.log(`✅ Limpeza concluída: ${deletedCount} relatórios removidos`);
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    console.error('❌ Erro na limpeza de relatórios:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Lista relatórios de um usuário para debugging/admin
 */
export async function listUserReports(ownerId: string) {
  try {
    const reports = await ReportService.getUserReports(ownerId);
    
    return {
      success: true,
      reports: reports.map(report => ({
        id: report.id,
        monthYear: report.monthYear,
        createdAt: report.createdAt,
        htmlSize: report.analysisHtml.length
      }))
    };
  } catch (error) {
    console.error('❌ Erro ao listar relatórios:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}