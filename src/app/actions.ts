"use server";

import { personalizedBudgetAnalysis } from '@/ai/flows/personalized-budget-analysis';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { transactions, goals } from '@/lib/data';

const schema = z.object({
  financialHabits: z.string().min(20, { message: 'Por favor, descreva seus hábitos financeiros com mais detalhes.' }),
});

export type AnalysisState = {
  message?: string | null;
  analysis?: string;
  suggestions?: string[];
  errors?: {
    financialHabits?: string[];
  };
};

export async function analyzeBudget(prevState: AnalysisState, formData: FormData): Promise<AnalysisState> {
  const validatedFields = schema.safeParse({
    financialHabits: formData.get('financialHabits'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  // In a real app, this data would come from a database based on the authenticated user.
  // Here we use mock data for demonstration.
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sharedGoals = goals.map(g => ({
    name: g.name,
    targetAmount: g.targetAmount,
    currentSavings: g.currentAmount,
  }));

  try {
    const result = await personalizedBudgetAnalysis({
      income,
      expenses,
      sharedGoals,
      financialHabits: validatedFields.data.financialHabits,
    });
    
    revalidatePath('/');
    return {
      message: 'Análise concluída!',
      analysis: result.analysis,
      suggestions: result.suggestions,
    };
  } catch (error) {
    console.error('Error calling GenAI flow:', error);
    return {
      message: 'Ocorreu um erro ao gerar a análise. Tente novamente mais tarde.',
    };
  }
}
