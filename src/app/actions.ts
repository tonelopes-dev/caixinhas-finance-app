"use server";

import { personalizedBudgetAnalysis } from '@/ai/flows/personalized-budget-analysis';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { chatWithReport } from '@/ai/flows/financial-report-flow';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { transactions, goals, user, financialReports } from '@/lib/data';
import { redirect } from 'next/navigation';

const analysisSchema = z.object({
  financialHabits: z.string().min(20, { message: 'Por favor, descreva seus hábitos financeiros com mais detalhes.' }),
});

const transactionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'O tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'A categoria é obrigatória.' }),
  date: z.string().optional(),
  sourceAccountId: z.string().optional(),
  destinationAccountId: z.string().optional(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'transfer', 'boleto', 'cash']).optional(),
  isRecurring: z.boolean().optional(),
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

const deleteTransactionSchema = z.object({
  id: z.string(),
});

const registerSchema = z.object({
    name: z.string().min(1, { message: 'O nome é obrigatório.' }),
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
    password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
});

const inviteSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

const passwordResetSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

const financialReportSchema = z.object({
    reportId: z.string(),
    message: z.string(),
    chatHistory: z.string().optional(),
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
    id?: string[];
    description?: string[];
    amount?: string[];
    type?: string[];
    category?: string[];
    date?: string[];
    sourceAccountId?: string[];
    destinationAccountId?: string[];
    paymentMethod?: string[];
    isRecurring?: string[];
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

export type GenericState = {
    message?: string | null;
    errors?: {
        email?: string[];
        name?: string[];
        password?: string[];
    }
}

export type FinancialReportState = {
  reportId: string;
  analysis?: string;
  sender?: 'user' | 'assistant';
  error?: string;
};


export async function getFinancialReport(prevState: FinancialReportState, formData: FormData): Promise<FinancialReportState> {
  const validatedFields = financialReportSchema.safeParse({
    reportId: formData.get('reportId'),
    message: formData.get('message'),
    chatHistory: formData.get('chatHistory'),
  });

  if (!validatedFields.success) {
    return { ...prevState, error: 'Dados inválidos.', sender: 'assistant' };
  }

  const { reportId, message, chatHistory } = validatedFields.data;
  
  const report = financialReports.find(r => r.id === reportId);
  if (!report) {
    return { ...prevState, error: 'Relatório não encontrado.', sender: 'assistant' };
  }

  try {
    const result = await chatWithReport({
        reportContext: report.analysisHtml,
        question: message,
        chatHistory: chatHistory || '[]',
    });

    return {
        reportId: reportId,
        analysis: result.answer,
        sender: 'assistant'
    };
  } catch (error) {
    console.error('Error calling GenAI flow:', error);
    return {
      ...prevState,
      error: 'Ocorreu um erro ao conversar com o assistente. Tente novamente.',
      sender: 'assistant'
    };
  }
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
    date: formData.get('date'),
    sourceAccountId: formData.get('sourceAccountId'),
    destinationAccountId: formData.get('destinationAccountId'),
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: formData.get('isRecurring') === 'on',
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
    date: validatedFields.data.date || new Date().toISOString(),
    ...validatedFields.data
  })
  console.log('New transaction added:', validatedFields.data);

  revalidatePath('/');
  revalidatePath('/transactions');


  return { message: 'Transação adicionada com sucesso!' };
}

export async function updateTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const validatedFields = transactionSchema.safeParse({
    id: formData.get('id'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date'),
    sourceAccountId: formData.get('sourceAccountId'),
    destinationAccountId: formData.get('destinationAccountId'),
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: formData.get('isRecurring') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  const { id, ...data } = validatedFields.data;
  const index = transactions.findIndex(t => t.id === id);

  if (index > -1) {
    transactions[index] = {
      ...transactions[index],
      ...data,
      date: data.date || transactions[index].date,
    };
    console.log(`Transaction with id ${id} updated.`);
    revalidatePath('/');
    revalidatePath('/transactions');
    return { message: 'Transação atualizada com sucesso!' };
  }
  
  return { message: 'Erro: Transação não encontrada.' };
}

export async function deleteTransaction(formData: FormData) {
  const validatedFields = deleteTransactionSchema.safeParse({
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    return {
      message: 'ID da transação inválido.',
    };
  }
  
  const { id } = validatedFields.data;
  const index = transactions.findIndex(t => t.id === id);

  if (index > -1) {
    transactions.splice(index, 1);
    console.log(`Transaction with id ${id} deleted.`);
  }

  revalidatePath('/');
  revalidatePath('/transactions');
  return { message: 'Transação excluída com sucesso!' };
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

export async function registerUser(prevState: GenericState, formData: FormData): Promise<GenericState> {
    const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Falha na validação. Por favor, verifique os campos.',
        };
    }

    // In a real app, you'd save the user to the database here.
    console.log('New user registered:', validatedFields.data);

    try {
        await sendEmail({
            to: validatedFields.data.email,
            subject: 'Bem-vindo(a) ao DreamVault!',
            body: `<h1>Olá, ${validatedFields.data.name}!</h1><p>Sua conta no DreamVault foi criada com sucesso. Comece a planejar seus sonhos hoje mesmo!</p>`
        });
    } catch (error) {
        console.error("Email sending failed:", error);
        // We don't block registration if email fails, but we could log it.
    }

    // This would typically redirect to the login page or the dashboard
    redirect('/login');
}


export async function sendPartnerInvite(prevState: GenericState, formData: FormData): Promise<GenericState> {
    const validatedFields = inviteSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Falha na validação.',
        };
    }
    
    try {
        await sendEmail({
            to: validatedFields.data.email,
            subject: `Você foi convidado(a) para o DreamVault por ${user.name}!`,
            body: `<h1>Convite para o DreamVault</h1><p>${user.name} te convidou para planejarem seus sonhos juntos. Clique no link para aceitar: [link de convite aqui]</p>`
        });
        return { message: 'Convite enviado com sucesso!' };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { message: 'Ocorreu um erro ao enviar o convite. Tente novamente.' };
    }
}


export async function sendGoalInvite(email: string, goalName: string): Promise<{message: string}> {
    if(!email) return { message: 'E-mail inválido.'};
    
    try {
        await sendEmail({
            to: email,
            subject: `Você foi convidado(a) para a caixinha "${goalName}"`,
            body: `<h1>Convite para Caixinha</h1><p>${user.name} te convidou para participar da caixinha "${goalName}".`
        });
        return { message: 'Convite enviado com sucesso!' };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { message: 'Ocorreu um erro ao enviar o convite. Tente novamente.' };
    }
}


export async function sendPasswordReset(prevState: GenericState, formData: FormData): Promise<GenericState> {
    const validatedFields = passwordResetSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Falha na validação.',
        };
    }

    try {
        await sendEmail({
            to: validatedFields.data.email,
            subject: 'Redefinição de Senha - DreamVault',
            body: `<h1>Redefinição de Senha</h1><p>Recebemos uma solicitação para redefinir sua senha. Clique no link para criar uma nova senha: [link de redefinição aqui]</p>`
        });
        return { message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' };
    } catch (error) {
        console.error("Email sending failed:", error);
        // Don't reveal if the email exists or not
        return { message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' };
    }
}
