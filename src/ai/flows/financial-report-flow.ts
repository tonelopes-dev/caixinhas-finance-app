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
  prompt: `Você é um analista financeiro de elite, especializado em finanças para casais. Sua tarefa é criar um relatório de saúde financeira profissional, detalhado e encorajador para o mês de {{month}}, baseado nas transações fornecidas.

Use o seguinte formato HTML para a sua resposta. Seja direto, informativo e use uma linguagem positiva.

<h3>Análise Financeira de {{month}}</h3>

<h4>⭐ Resumo Executivo</h4>
<p>Faça um resumo conciso (2-3 frases) dos principais destaques do mês, como a taxa de poupança, o saldo líquido e se os gastos ficaram dentro do esperado. Mantenha um tom otimista.</p>

<h4>💰 Fluxo de Caixa Mensal</h4>
<ul>
    <li><b>Receita Total:</b> Calcule e exiba o total de receitas (transações do tipo 'income').</li>
    <li><b>Despesa Total:</b> Calcule e exiba o total de despesas (transações do tipo 'expense').</li>
    <li><b>Saldo Líquido:</b> Calcule e exiba a diferença (Receita - Despesa). Comente brevemente se o saldo foi positivo ou negativo.</li>
    <li><b>Taxa de Poupança:</b> Calcule a porcentagem da receita que foi economizada (total de transferências para 'Caixinha' / Receita Total). Elogie se a taxa for boa (acima de 15%).</li>
</ul>

<h4>📊 Detalhamento das Despesas</h4>
<p>Abaixo está a distribuição completa dos seus gastos este mês. Use esta visão para entender para onde o dinheiro está indo.</p>
<ul>
    <li>Liste <b>TODAS</b> as categorias de despesa com seu valor total e a porcentagem que representam do total de despesas. Ex: <b>Alimentação:</b> R$ XXX,XX (YY%).</li>
</ul>

<h4>🎯 Progresso das Metas (Caixinhas)</h4>
<p>Analise as transferências para as caixinhas (transações com categoria 'Caixinha' ou tipo 'transfer' para uma meta). Comente se as contribuições foram consistentes e como isso impacta os objetivos.</p>

<h4>🧠 Insights e Recomendações Práticas</h4>
<p>Com base em <b>toda</b> a análise, forneça 2-3 insights práticos e acionáveis em uma lista ordenada (ol). As sugestões devem ser específicas e personalizadas.</p>
<ol>
    <li><b>Exemplo de Insight 1:</b> "Percebi que a categoria 'Lazer' representou 25% dos gastos. Que tal explorar programas gratuitos na cidade no próximo mês para acelerar a meta da 'Reforma da Cozinha'?"</li>
    <li><b>Exemplo de Insight 2:</b> "Sua taxa de poupança de 21% é fantástica! Para otimizar ainda mais, considerem automatizar uma pequena transferência para o 'Fundo de Emergência' logo no início do mês."</li>
</ol>

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
  prompt: `Você é um assistente financeiro prestativo e amigável. Sua única função é responder a perguntas sobre o relatório financeiro fornecido abaixo. Baseie-se exclusivamente nas informações do relatório e no histórico da conversa. Não responda a nenhuma pergunta que não esteja diretamente relacionada a estes dados.

**Relatório Financeiro Analisado:**
\`\`\`html
{{{reportContext}}}
\`\`\`

**Histórico da Conversa (JSON):**
{{{chatHistory}}}

**Pergunta do Usuário:**
{{question}}

Responda à pergunta do usuário de forma clara, concisa e sempre com um tom positivo e encorajador.
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
