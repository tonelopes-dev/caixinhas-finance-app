import { ReportService } from '@/services/ReportService';

/**
 * Função de teste para verificar as regras de relatórios
 * Útil para debugging e validação das implementações
 */
export async function testReportRules(ownerId: string) {
  console.log('🧪 Testando regras de relatórios para:', ownerId);
  
  try {
    // Teste 1: Verificar se tem transações
    console.log('\n📊 Teste 1: Verificando transações...');
    const hasTransactions = await ReportService.hasAnyTransactions(ownerId);
    console.log('✅ Tem transações:', hasTransactions);
    
    if (!hasTransactions) {
      console.log('🚫 Usuário sem transações - interface deve estar oculta');
      return;
    }
    
    // Teste 2: Listar meses disponíveis
    console.log('\n📅 Teste 2: Meses com transações...');
    const monthsWithTransactions = await ReportService.getMonthsWithTransactions(ownerId);
    console.log('📋 Meses disponíveis:', monthsWithTransactions.map(m => `${m.label} (${m.value})`));
    
    if (monthsWithTransactions.length === 0) {
      console.log('⚠️ Nenhum mês com transações encontrado');
      return;
    }
    
    // Teste 3: Status de relatórios para cada mês
    console.log('\n📈 Teste 3: Status dos relatórios...');
    for (const month of monthsWithTransactions.slice(0, 3)) { // Testa apenas os 3 primeiros
      const status = await ReportService.getReportStatus(ownerId, month.label);
      console.log(`📊 ${month.label}:`, {
        existe: status.exists,
        desatualizado: status.isOutdated,
        botão: status.buttonLabel,
        habilitado: status.buttonEnabled
      });
    }
    
    // Teste 4: Relatórios salvos do usuário
    console.log('\n💾 Teste 4: Relatórios salvos...');
    const savedReports = await ReportService.getUserReports(ownerId);
    console.log('📁 Total de relatórios salvos:', savedReports.length);
    savedReports.forEach(report => {
      console.log(`  - ${report.monthYear} (criado em: ${report.createdAt.toLocaleDateString('pt-BR')})`);
    });
    
    console.log('\n✅ Teste completo!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

/**
 * Função para simular cenários de teste
 */
export async function simulateReportScenarios(ownerId: string) {
  console.log('🎭 Simulando cenários de relatórios...');
  
  // Cenário 1: Estado inicial sem relatório
  console.log('\n🎬 Cenário 1: Primeiro relatório do mês');
  const status1 = await ReportService.getReportStatus(ownerId, 'Novembro de 2024');
  console.log('Status:', status1);
  
  // Simular salvamento de relatório
  console.log('\n💾 Salvando relatório de teste...');
  const testReport = await ReportService.saveReport({
    ownerId,
    monthYear: 'Novembro de 2024',
    analysisHtml: '<div>Relatório de teste gerado automaticamente</div>'
  });
  
  if (testReport) {
    console.log('✅ Relatório salvo com sucesso');
    
    // Cenário 2: Relatório existente e atualizado
    console.log('\n🎬 Cenário 2: Relatório existente');
    const status2 = await ReportService.getReportStatus(ownerId, 'Novembro de 2024');
    console.log('Status:', status2);
  }
  
  console.log('\n🎭 Simulação completa!');
}

/**
 * Função para limpar dados de teste
 */
export async function cleanupTestData(ownerId: string) {
  console.log('🧹 Limpando dados de teste...');
  
  try {
    const deleted = await ReportService.deleteReport(ownerId, 'Novembro de 2024');
    console.log('🗑️ Relatório de teste removido:', deleted);
  } catch (error) {
    console.log('ℹ️ Nenhum relatório de teste para remover');
  }
}