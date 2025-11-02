'use server';
/**
 * @fileOverview This file defines Genkit flows for financial analysis.
 *
 * It includes:
 * - `generateFinancialReport`: An async function that creates a detailed monthly financial report.
 * - `chatWithReport`: An async function that allows a user to ask questions about their report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Esquema de Análise de Relatório ---
const FinancialReportInputSchema = z.object({
  month: z.string().describe('O mês do relatório (ex: "Julho de 2024").'),
  transactions: z.string().describe('Uma lista de transações em formato JSON.'),
});

const FinancialReportOutputSchema = z.object({
  analysisHtml: z.string().describe('Uma análise financeira detalhada em formato HTML. Use títulos (h3, h4), parágrafos, listas (ul, li) e negrito (b) para formatar.'),
});

// --- Esquema de Chat com Relatório ---
const ChatWithReportInputSchema = z.object({
  reportContext: z.string().describe('O conteúdo do relatório financeiro em HTML para fornecer contexto.'),
  question: z.string().describe('A pergunta do usuário sobre o relatório.'),
  chatHistory: z.string().describe('O histórico da conversa em formato JSON.'),
});

const ChatWithReportOutputSchema = z.object({
  answer: z.string().describe('A resposta para a pergunta do usuário, baseada no relatório e no histórico do chat.'),
});


// --- Fluxo para Gerar o Relatório ---
export async function generateFinancialReport(input: z.infer<typeof FinancialReportInputSchema>): Promise<z.infer<typeof FinancialReportOutputSchema>> {
  return generateReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'financialReportPrompt',
  input: { schema: FinancialReportInputSchema },
  output: { schema: FinancialReportOutputSchema },
  prompt: `Você é um analista financeiro especialista. Sua tarefa é criar um relatório de saúde financeira profissional e detalhado para o mês de {{month}}, baseado nas transações fornecidas.

Use o seguinte formato HTML para a sua resposta. Seja direto e informativo.

### Análise de {{month}}

#### 💡 Resumo Geral
- **Receita Total:** Calcule o total de receitas.
- **Despesa Total:** Calcule o total de despesas.
- **Saldo Líquido:** Calcule a diferença (Receita - Despesa).
- **Taxa de Poupança:** Calcule a porcentagem da receita que foi economizada.

#### 📈 Análise de Despesas
Crie uma lista das 3 maiores categorias de despesa, com o valor e a porcentagem do total de despesas.
- **Categoria 1:** R$ VALOR (X%)
- **Categoria 2:** R$ VALOR (Y%)
- **Categoria 3:** R$ VALOR (Z%)

#### 🎯 Progresso das Metas
Analise se as transferências para as caixinhas (metas) foram consistentes.

#### 🧠 Insights e Recomendações
Com base na análise, forneça 2-3 insights práticos e acionáveis. Por exemplo, aponte uma categoria com gastos elevados e sugira uma estratégia para reduzir, ou elogie uma boa taxa de poupança.

**Transações do Mês (JSON):**
{{{transactions}}}
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: FinancialReportInputSchema,
    outputSchema: FinancialReportOutputSchema,
  },
  async (input) => {
    const { output } = await reportPrompt(input);
    return output!;
  }
);


// --- Fluxo para Conversar sobre o Relatório ---
export async function chatWithReport(input: z.infer<typeof ChatWithReportInputSchema>): Promise<z.infer<typeof ChatWithReportOutputSchema>> {
  return chatWithReportFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatWithReportPrompt',
  input: { schema: ChatWithReportInputSchema },
  output: { schema: ChatWithReportOutputSchema },
  prompt: `Você é um assistente financeiro prestativo. Sua única função é responder perguntas sobre o relatório financeiro fornecido. Não responda a nenhuma pergunta que não esteja diretamente relacionada ao relatório.

**Relatório Financeiro:**
{{{reportContext}}}

**Histórico da Conversa (JSON):**
{{{chatHistory}}}

**Pergunta do Usuário:**
{{question}}

Responda à pergunta do usuário de forma concisa e amigável, usando apenas as informações do relatório.
`,
});

const chatWithReportFlow = ai.defineFlow(
  {
    name: 'chatWithReportFlow',
    inputSchema: ChatWithReportInputSchema,
    outputSchema: ChatWithReportOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);
