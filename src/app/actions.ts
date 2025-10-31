"use server";

import { personalizedBudgetAnalysis } from '@/ai/flows/personalized-budget-analysis';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { transactions, goals } from '@/lib/data';
import { redirect } from 'next/navigation';

const analysisSchema = z.object({
  financialHabits: z.string().min(20, { message: 'Por favor, descreva seus hábitos financeiros com mais detalhes.' }),
});

const transactionSchema = z.object({
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'O tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'A categoria é obrigatória.' }),
  sourceAccountId: z.string().optional(),
  destinationAccountId: z.string().optional(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'transfer', 'boleto', 'cash']).optional(),
}).refine(data => {
    if (data.type === 'income') return !!data.destinationAccountId;
    if (data.type === 'expense') return !!data.sourceAccountId;
    if (data.type === 'transfer') return !!data.sourceAccountId && !!data.destinationAccountId;
    return false;
}, {
    message: "A conta de origem e/ou destino é necessária dependendo do tipo de transação.",
    path: ['sourceAccountId'],
});


const goalSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  emoji: z.string().min(1, { message: 'O emoji é obrigatório.' }),
  targetAmount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  visibility: z.enum(['shared', 'private'], { required_error: 'A visibilidade é obrigatória.' }),
});

const goalTransactionSchema = z.object({
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['deposit', 'withdrawal']),
  goalId: z.string(),
});

const deleteGoalSchema = z.object({
  id: z.string(),
});


export type AnalysisState = {
  message?: string | null;
  analysis?: string;
  suggestions?: string[];
  errors?: {
    financialHabits?: string[];
  };
};

export type TransactionState = {
  message?: string | null;
  errors?: {
    description?: string[];
    amount?: string[];
    type?: string[];
    category?: string[];
    sourceAccountId?: string[];
    destinationAccountId?: string[];
    paymentMethod?: string[];
  };
}

export type GoalState = {
  message?: string | null;
  errors?: {
    name?: string[];
    emoji?: string[];
    targetAmount?: string[];
    visibility?: string[];
  };
}

export type GoalTransactionState = {
  message?: string | null;
  errors?: {
    amount?: string[];
  };
}

export async function analyzeBudget(prevState: AnalysisState, formData: FormData): Promise<AnalysisState> {
  const validatedFields = analysisSchema.safeParse({
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

export async function addTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const validatedFields = transactionSchema.safeParse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    sourceAccountId: formData.get('sourceAccountId'),
    destinationAccountId: formData.get('destinationAccountId'),
    paymentMethod: formData.get('paymentMethod'),
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }
  
  // NOTE: This is mock data. In a real application, you would save this to a database.
  transactions.unshift({
    id: (transactions.length + 1).toString(),
    date: new Date().toISOString().split('T')[0],
    ...validatedFields.data
  })
  console.log('New transaction added:', validatedFields.data);

  revalidatePath('/');
  revalidatePath('/transactions');


  return { message: 'Transação adicionada com sucesso!' };
}

export async function addGoal(prevState: GoalState, formData: FormData): Promise<GoalState> {
  const validatedFields = goalSchema.safeParse({
    name: formData.get('name'),
    emoji: formData.get('emoji'),
    targetAmount: formData.get('targetAmount'),
    visibility: formData.get('visibility'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  // NOTE: This is mock data. In a real application, you would save this to a database.
  goals.push({
    id: `goal${goals.length + 1}`,
    currentAmount: 0,
    ...validatedFields.data
  })
  console.log('New goal added:', validatedFields.data);
  
  revalidatePath('/');
  redirect('/');
}

export async function goalTransaction(prevState: GoalTransactionState, formData: FormData): Promise<GoalTransactionState> {
  const validatedFields = goalTransactionSchema.safeParse({
    amount: formData.get('amount'),
    type: formData.get('type'),
    goalId: formData.get('goalId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }
  
  // NOTE: This is mock data. In a real application, you would save this to a database.
  console.log('Goal transaction:', validatedFields.data);
  const { amount, type, goalId } = validatedFields.data;

  const goal = goals.find(g => g.id === goalId);

  if (goal) {
    if (type === 'deposit') {
      goal.currentAmount += amount;
      transactions.unshift({
        id: (transactions.length + 1).toString(),
        date: new Date().toISOString(),
        description: `Depósito na caixinha: ${goal.name}`,
        amount,
        type: 'transfer',
        category: 'Caixinha',
        sourceAccountId: 'acc1', // Mock: assuming it comes from the main account
        destinationAccountId: goalId,
      })

    } else {
      const newAmount = Math.max(0, goal.currentAmount - amount);
      const withdrawnAmount = goal.currentAmount - newAmount;
      goal.currentAmount = newAmount;

      transactions.unshift({
        id: (transactions.length + 1).toString(),
        date: new Date().toISOString(),
        description: `Retirada da caixinha: ${goal.name}`,
        amount: withdrawnAmount,
        type: 'transfer',
        category: 'Caixinha',
        sourceAccountId: goalId, 
        destinationAccountId: 'acc1', // Mock: assuming it goes to the main account
      })
    }
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath(`/`);
  revalidatePath('/transactions');


  return { message: 'Transação na caixinha realizada com sucesso!' };
}

export async function deleteGoal(formData: FormData) {
  const validatedFields = deleteGoalSchema.safeParse({
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    // Handle error - maybe return a message
    return {
      message: 'ID da caixinha inválido.',
    };
  }

  const { id } = validatedFields.data;
  const index = goals.findIndex(g => g.id === id);

  if (index > -1) {
    goals.splice(index, 1);
    console.log(`Goal with id ${id} deleted.`);
  }

  revalidatePath('/');
  redirect('/');
}
