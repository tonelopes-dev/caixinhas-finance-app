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
  analysis: z.string().describe('A personalized analysis of the user\u2019s spending patterns and saving opportunities.'),
  suggestions: z.array(z.string()).describe('A list of suggestions for optimizing savings towards shared goals.'),
});
export type PersonalizedBudgetAnalysisOutput = z.infer<typeof PersonalizedBudgetAnalysisOutputSchema>;

export async function personalizedBudgetAnalysis(input: PersonalizedBudgetAnalysisInput): Promise<PersonalizedBudgetAnalysisOutput> {
  return personalizedBudgetAnalysisFlow(input);
}

const budgetAnalysisPrompt = ai.definePrompt({
  name: 'budgetAnalysisPrompt',
  input: {schema: ProcessedBudgetAnalysisInputSchema},
  output: {schema: PersonalizedBudgetAnalysisOutputSchema},
  prompt: `You are a financial advisor providing personalized budget analysis and savings suggestions for couples.

  Analyze the user's income, expenses, shared goals, and financial habits to provide actionable insights.

  Income: {{income}}
  Expenses (as JSON): {{{expensesJSON}}}
  Shared Goals:
  {{#each sharedGoals}}
  - Name: {{name}}, Target Amount: {{targetAmount}}, Current Savings: {{currentSavings}}
  {{/each}}
  Financial Habits: {{financialHabits}}

  Provide a concise analysis of their spending patterns and suggest ways to optimize savings towards their shared goals.

  The analysis should include specific areas where they can cut expenses or increase savings.

  The suggestions should be practical and tailored to their financial situation and habits.
  The 'expenses' data is a JSON object where keys are categories and values are the amounts.
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
