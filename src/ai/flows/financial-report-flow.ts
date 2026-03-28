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
3. Gastos por Categoria (agrupe por category.name)
4. Métodos de Pagamento (agrupe por paymentMethod)
5. Parcelamentos Ativos (APENAS se isInstallment=true)
6. Patrimônio Líquido (saldo acumulado do mês)
7. Pontos Positivos e de Atenção (baseados nos dados)
8. Recomendações Práticas (baseadas em problemas reais identificados)

**Dados (Transações do mês {{month}} em JSON):**
{{{transactions}}}

**Dados (Transações do mês {{month}} em JSON):**
{{{transactions}}}

**Gere um relatório HTML usando Tailwind CSS com estas seções:**

1. **Saúde Financeira** (score 0-100 baseado em: poupança, comprometimento)
2. **Cards de Métricas** (receitas, despesas, saldo, média diária)
3. **Visão Executiva** (parágrafo resumindo o mês)
4. **Patrimônio** (saldo final, taxa poupança, contas movimentadas)
5. **Gastos por Categoria** (tabela ou cards com valores e %)
6. **Métodos de Pagamento** (distribuição real encontrada)
7. **Parcelamentos** (SOMENTE se existirem nos dados)
8. **Pontos Positivos e de Atenção** (listas baseadas nos dados)
9. **Recomendações Práticas** (3-5 ações priorizadas por impacto)
10. **Mensagem Motivacional** (personalizada aos acertos)

Use classes Tailwind: bg-card, border, rounded-lg, p-4/p-6, font-bold, grid, flex, space-y-4, etc.

**REGRA DE DESIGN CRÍTICA:** 
❌ NUNCA use gradientes claros (ex: bg-blue-100, bg-green-200) com texto branco. 
✅ Para blocos de "Parabéns" ou "Atenção", use fundos suaves com texto escuro: e.g., \`bg-[#ff6b7b]/10 text-[#2D241E]\` ou \`bg-emerald-50 text-emerald-900\`. 
✅ Garanta que todo texto seja perfeitamente legível sobre o fundo.
✅ SEMPRE verifique o campo \`paymentMethod\` no JSON de transações para a seção de Métodos de Pagamento.
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
