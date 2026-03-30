'use server';
/**
 * @fileOverview This file defines a Genkit flow for financial analysis.
 *
 * It includes:
 * - `generateFinancialReport`: An async function that creates a detailed monthly financial report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinancialReportInputSchema = z.object({
  month: z.string().describe('O mês do relatório (ex: "Julho de 2024").'),
  transactions: z.string().describe('Uma lista de transações em formato JSON.'),
});

const FinancialReportOutputSchema = z.object({
  analysisHtml: z.string().describe('Uma análise financeira detalhada em formato HTML, seguindo estritamente o layout e componentes fornecidos.'),
});


export async function generateFinancialReport(input: z.infer<typeof FinancialReportInputSchema>): Promise<z.infer<typeof FinancialReportOutputSchema>> {
  return generateReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'financialReportPrompt',
  input: { schema: FinancialReportInputSchema },
  output: { schema: FinancialReportOutputSchema },
  prompt: `Você é um CFP (Certified Financial Planner) brasileiro especializado em análise financeira pessoal.

**REGRAS ABSOLUTAS:**
❌ NUNCA invente dados ou transações que não existem no JSON
❌ NUNCA use nomes de meses em inglês - use apenas português ({{month}} já está correto)
✅ Use APENAS dados reais das transações fornecidas
✅ Se faltar dados para alguma análise, OMITA essa seção
✅ Formato: R$ 1.234,56 (português do Brasil)

**ANÁLISES OBRIGATÓRIAS (calcule dos dados reais):**
1. Receitas vs Despesas (separe por tipo: INCOME vs EXPENSE)
2. Taxa de Poupança (saldo/receita)
3. Gastos por Categoria (agrupe por category.name ou campo category)
4. Métodos de Pagamento (agrupe por paymentMethod)
5. Contas Movimentadas (agrupe pelo campo account)
6. Parcelamentos Ativos (APENAS se isInstallment=true)
7. Patrimônio Líquido (saldo acumulado do mês)
8. Pontos Positivos e de Atenção (baseados nos dados)
9. Recomendações Práticas (baseadas em problemas reais identificados)

**Dados (Transações do mês {{month}} em JSON):**
{{{transactions}}}

**Gere um relatório HTML usando Tailwind CSS com estas seções:**

1. **Saúde Financeira** (score 0-100 baseado em: poupança, comprometimento)
2. **Cards de Métricas** (receitas, despesas, saldo, média diária)
3. **Visão Executiva** (parágrafo resumindo o mês)
4. **Patrimônio** (saldo final, taxa poupança, contas movimentadas listando o NOME das contas)
5. **Gastos por Categoria** (tabela ou cards com valores e %)
6. **Métodos de Pagamento** (distribuição real encontrada)
7. **Parcelamentos** (SOMENTE se existirem nos dados)
8. **Pontos Positivos e de Atenção** (listas baseadas nos dados)
9. **Recomendações Práticas** (3-5 ações priorizadas por impacto)
10. **Mensagem Motivacional** (personalizada aos acertos)

Use classes Tailwind: bg-white, border, rounded-[24px] md:rounded-[32px], p-4 md:p-8, font-bold, grid grid-cols-1 md:grid-cols-2, gap-4 md:gap-6, flex flex-col md:flex-row, space-y-6, etc.

**REGRA DE DESIGN CRÍTICA:** 
❌ NUNCA use fundos beges ou cremes (ex: bg-[#FBF7F4], bg-amber-50) para as seções principais, pois eles somem no fundo do app.
❌ NUNCA use grades de colunas fixas (ex: grid-cols-4) sem o prefixo responsivo. 
✅ SEMPRE comece com \`grid-cols-1\` para mobile e use \`md:grid-cols-2\` ou \`md:grid-cols-4\` para desktop.
✅ Use \`bg-white\` para as seções de "Saúde Financeira", "Visão Executiva", "Patrimônio", etc., com \`shadow-sm\` e \`border-[#2D241E]/10\`.
✅ Para blocos de destaque (Cards de Métricas), use \`bg-white\` ou fundos levemente coloridos mas com bordas claras.
✅ Para blocos de "Parabéns" ou "Atenção", use fundos suaves com texto escuro: e.g., \`bg-[#ff6b7b]/10 text-[#2D241E]\` ou \`bg-emerald-50 text-emerald-900\`. 
✅ Garanta que todo texto seja perfeitamente legível sobre o fundo.
✅ SEMPRE verifique o campo \`paymentMethod\` no JSON de transações para a seção de Métodos de Pagamento.

**UI MOCKUP EXATO PARA A SEÇÃO "SAÚDE FINANCEIRA":**
Para mostrar o "Score", você DEVE OBRIGATORIAMENTE usar ESTRITAMENTE o HTML a seguir para criar um gráfico circular, apenas trocando a variável SCORE pelo número real e a COR dependendo se o score for alto (emerald-500) ou baixo (red-500):
<div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 md:p-8 bg-white rounded-[24px] md:rounded-[32px] border border-[#2D241E]/10">
  <div class="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-full border-[8px] border-[#2D241E]/5 overflow-hidden">
    <svg class="absolute inset-0 w-full h-full transform -rotate-90">
      <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" fill="transparent" style="stroke-dasharray: 251; stroke-dashoffset: calc(251 - (251 * SCORE) / 100);" class="text-emerald-500 transition-all duration-1000" />
    </svg>
    <span class="font-black text-2xl text-[#2D241E]">SCORE%</span>
  </div>
  <div class="space-y-2 text-center sm:text-left">
    <h3 class="font-bold text-xl text-[#2D241E]">Score: SCORE/100</h3>
    <p class="text-sm font-bold text-[#2D241E]/60 leading-relaxed max-w-lg">Sua análise e conselho do respectivo score...</p>
  </div>
</div>
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: FinancialReportInputSchema,
    outputSchema: FinancialReportOutputSchema,
  },
  async (input) => {
    // Retry com backoff exponencial mais agressivo para Gemini
    const maxRetries = 5;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { output } = await reportPrompt(input);
        return output!;
      } catch (error: any) {
        lastError = error;
        
        // Verifica se é erro de sobrecarga (503 ou status UNAVAILABLE)
        const isOverloaded = error.code === 503 || error.status === 'UNAVAILABLE';
        
        if (isOverloaded && attempt < maxRetries) {
          // Backoff mais agressivo: 3s, 6s, 12s, 24s
          const waitTime = Math.pow(2, attempt) * 1500;
          console.warn(`🔄 Gemini sobrecarregado. Tentativa ${attempt}/${maxRetries}. Aguardando ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Para outros erros ou última tentativa, lança o erro
        console.error(`❌ Falha na geração do relatório (tentativa ${attempt}/${maxRetries}):`, error.message);
        throw error;
      }
    }
    
    throw lastError;
  }
);
