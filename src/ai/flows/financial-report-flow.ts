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
  prompt: `Você é um analista financeiro de elite, especialista em finanças para casais, com um toque de coach motivacional. Sua tarefa é criar um relatório de saúde financeira para o mês de {{month}}, baseado nas transações fornecidas.

**Tarefa:**
Gere um relatório completo e visualmente atraente usando **exclusivamente** o formato HTML especificado abaixo. Use classes do Tailwind CSS para estilização, conforme os exemplos. O tom deve ser encorajador, profissional e direto.

**Dados para Análise (Transações do Mês em JSON):**
{{{transactions}}}

---

**Formato de Saída HTML Obrigatório (Use este template como base):**
\`\`\`html
<div class="space-y-8">
    <!-- Seção Saúde Financeira -->
    <div class="p-6 rounded-lg bg-card border flex justify-between items-center">
        <div>
            <h3 class="font-headline text-xl font-bold">Saúde Financeira: 80/100</h3>
            <p class="text-muted-foreground mt-1">Seu saldo positivo, investimentos regulares e controle de despesas são indicativos de uma boa saúde financeira, mas ainda há espaço para otimização.</p>
        </div>
        <div class="text-5xl font-bold text-green-500">80</div>
    </div>

    <!-- Seção Visão Geral -->
    <div class="p-6 rounded-lg bg-card border">
        <h3 class="font-headline text-lg font-bold mb-2">Visão Geral</h3>
        <p class="text-muted-foreground">Novembro foi um mês de conquistas! Com uma receita total de R$ 1800, você está mostrando um ótimo controle financeiro, mantendo suas despesas abaixo do esperado e ainda conseguindo investir. Parabéns pela disciplina!</p>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div class="p-4 rounded-lg bg-card border">
            <p class="text-sm text-muted-foreground">Receitas</p>
            <p class="text-2xl font-bold text-green-500">R$ 1.800,00</p>
        </div>
        <div class="p-4 rounded-lg bg-card border">
            <p class="text-sm text-muted-foreground">Despesas</p>
            <p class="text-2xl font-bold text-red-500">R$ 1.152,50</p>
        </div>
        <div class="p-4 rounded-lg bg-card border">
            <p class="text-sm text-muted-foreground">Investimentos</p>
            <p class="text-2xl font-bold text-blue-500">R$ 400,00</p>
        </div>
        <div class="p-4 rounded-lg bg-card border">
            <p class="text-sm text-muted-foreground">Saldo</p>
            <p class="text-2xl font-bold text-primary">R$ 247,50</p>
            <p class="text-xs text-muted-foreground">Taxa de poupança: 13.8%</p>
        </div>
    </div>
    
    <!-- Seções Pontos Positivos e de Atenção -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-lg bg-card border">
            <h3 class="font-headline text-lg font-bold mb-4">✅ Pontos Positivos</h3>
            <ul class="space-y-3 text-muted-foreground">
                <li class="flex items-start"><span class="mr-2 mt-1">✔</span><span>Você gerou uma receita sólida de R$ 1800, o que demonstra um bom planejamento financeiro.</span></li>
                <li class="flex items-start"><span class="mr-2 mt-1">✔</span><span>Seu saldo final de R$ 247,50 é um excelente resultado, mostrando que você está vivendo dentro de suas possibilidades.</span></li>
                <li class="flex items-start"><span class="mr-2 mt-1">✔</span><span>Investir R$ 400,00 é uma atitude muito positiva que contribuirá para o seu futuro financeiro.</span></li>
            </ul>
        </div>
        <div class="p-6 rounded-lg bg-card border">
            <h3 class="font-headline text-lg font-bold mb-4">⚠️ Pontos de Atenção</h3>
            <ul class="space-y-3 text-muted-foreground">
                <li class="flex items-start"><span class="mr-2 mt-1">👉</span><span>A categoria de moradia representa 52.1% das suas despesas. Considere revisar se há opções mais econômicas.</span></li>
                <li class="flex items-start"><span class="mr-2 mt-1">👉</span><span>A despesa de transporte com gasolina foi de R$ 150,50, que pode ser uma área para explorar alternativas mais baratas.</span></li>
            </ul>
        </div>
    </div>

    <!-- Dicas Personalizadas -->
    <div>
        <h3 class="font-headline text-xl font-bold mb-4">Dicas Personalizadas</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div class="p-4 rounded-lg bg-card border">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold">Revisão de Aluguel</h4>
                    <span class="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">ALTA</span>
                </div>
                <p class="text-sm text-muted-foreground">Considere negociar o aluguel ou buscar opções mais acessíveis para reduzir significativamente suas despesas mensais.</p>
            </div>
            <div class="p-4 rounded-lg bg-card border">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold">Transporte Alternativo</h4>
                     <span class="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">MÉDIA</span>
                </div>
                <p class="text-sm text-muted-foreground">Use transporte público ou caronas para economizar na gasolina, o que pode reduzir gastos em até 30%.</p>
            </div>
             <div class="p-4 rounded-lg bg-card border">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold">Fundo de Emergência</h4>
                    <span class="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">BAIXA</span>
                </div>
                <p class="text-sm text-muted-foreground">Destine uma parte do saldo final para um fundo de emergência para garantir sua segurança financeira.</p>
            </div>
        </div>
    </div>

    <!-- Gastos por Categoria -->
    <div>
        <h3 class="font-headline text-xl font-bold mb-4">Gastos por Categoria</h3>
        <div class="p-4 rounded-lg bg-card border space-y-4">
            <div class="flex justify-between items-center">
                <span class="font-medium">Moradia</span>
                <span class="font-bold">R$ 600,00 <span class="text-sm font-normal text-muted-foreground">(52.1%)</span></span>
            </div>
            <div class="w-full bg-muted rounded-full h-2.5"><div class="bg-red-500 h-2.5 rounded-full" style="width: 52.1%"></div></div>
            
            <div class="flex justify-between items-center">
                <span class="font-medium">Transporte</span>
                <span class="font-bold">R$ 178,50 <span class="text-sm font-normal text-muted-foreground">(15.5%)</span></span>
            </div>
            <div class="w-full bg-muted rounded-full h-2.5"><div class="bg-orange-500 h-2.5 rounded-full" style="width: 15.5%"></div></div>

            <div class="flex justify-between items-center">
                <span class="font-medium">Outros</span>
                <span class="font-bold">R$ 115,00 <span class="text-sm font-normal text-muted-foreground">(10.0%)</span></span>
            </div>
            <div class="w-full bg-muted rounded-full h-2.5"><div class="bg-yellow-500 h-2.5 rounded-full" style="width: 10.0%"></div></div>
        </div>
    </div>
</div>
\`\`\`
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
