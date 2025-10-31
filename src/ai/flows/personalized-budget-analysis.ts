'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized budget analysis and savings suggestions.
 *
 * It includes:
 * - `personalizedBudgetAnalysis`: An async function that triggers the budget analysis flow.
 * - `PersonalizedBudgetAnalysisInput`: The input type for the `personalizedBudgetAnalysis` function.
 * - `PersonalizedBudgetAnalysisOutput`: The output type for the `personalizedBudgetAnalysis` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedBudgetAnalysisInputSchema = z.object({
  income: z.number().describe('The user’s monthly income.'),
  expenses: z.record(z.string(), z.number()).describe('A record of the user\u2019s monthly expenses, with categories as keys and amounts as values.'),
  sharedGoals: z.array(z.object({
    name: z.string().describe('The name of the shared goal.'),
    targetAmount: z.number().describe('The target amount for the goal.'),
    currentSavings: z.number().describe('The current savings towards the goal.'),
  })).describe('An array of shared financial goals with target amounts and current savings.'),
  financialHabits: z.string().describe('A description of the user\u2019s and their partner\'s financial habits.'),
});
export type PersonalizedBudgetAnalysisInput = z.infer<typeof PersonalizedBudgetAnalysisInputSchema>;

const ProcessedBudgetAnalysisInputSchema = z.object({
  income: z.number(),
  expensesJSON: z.string(),
  sharedGoals: z.array(z.object({
    name: z.string(),
    targetAmount: z.number(),
    currentSavings: z.number(),
  })),
  financialHabits: z.string(),
});

const PersonalizedBudgetAnalysisOutputSchema = z.object({
  analysis: z.string().describe('Uma análise personalizada dos padrões de gastos do usuário e oportunidades de economia.'),
  suggestions: z.array(z.string()).describe('Uma lista de sugestões para otimizar a economia em direção às metas compartilhadas.'),
});
export type PersonalizedBudgetAnalysisOutput = z.infer<typeof PersonalizedBudgetAnalysisOutputSchema>;

export async function personalizedBudgetAnalysis(input: PersonalizedBudgetAnalysisInput): Promise<PersonalizedBudgetAnalysisOutput> {
  return personalizedBudgetAnalysisFlow(input);
}

const budgetAnalysisPrompt = ai.definePrompt({
  name: 'budgetAnalysisPrompt',
  input: {schema: ProcessedBudgetAnalysisInputSchema},
  output: {schema: PersonalizedBudgetAnalysisOutputSchema},
  prompt: `Você é um consultor financeiro fornecendo análises orçamentárias personalizadas e sugestões de economia para casais. Responda sempre em português do Brasil.

  Analise a renda, despesas, metas compartilhadas e hábitos financeiros do usuário para fornecer insights práticos.

  Renda: {{income}}
  Despesas (em JSON): {{{expensesJSON}}}
  Metas Compartilhadas:
  {{#each sharedGoals}}
  - Nome: {{name}}, Valor Alvo: {{targetAmount}}, Economia Atual: {{currentSavings}}
  {{/each}}
  Hábitos Financeiros: {{financialHabits}}

  Forneça uma análise concisa de seus padrões de gastos e sugira maneiras de otimizar a economia em direção às suas metas compartilhadas.

  A análise deve incluir áreas específicas onde eles podem cortar despesas ou aumentar a economia.

  As sugestões devem ser práticas e adaptadas à sua situação financeira e hábitos.
  Os dados de 'despesas' são um objeto JSON onde as chaves são as categorias e os valores são os montantes.
`,
});

const personalizedBudgetAnalysisFlow = ai.defineFlow(
  {
    name: 'personalizedBudgetAnalysisFlow',
    inputSchema: PersonalizedBudgetAnalysisInputSchema,
    outputSchema: PersonalizedBudgetAnalysisOutputSchema,
  },
  async input => {
    // Convert expenses object to a JSON string before passing to the prompt
    const processedInput = {
      ...input,
      expensesJSON: JSON.stringify(input.expenses, null, 2),
    };

    const {output} = await budgetAnalysisPrompt(processedInput);
    return output!;
  }
);
