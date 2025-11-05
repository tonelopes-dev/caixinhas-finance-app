

"use server";

import { sendEmail } from '@/ai/flows/send-email-flow';
import { chatWithReport, generateFinancialReport } from '@/ai/flows/financial-report-flow';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { transactions, goals, user, savedReports } from '@/lib/data';
import { redirect } from 'next/navigation';

const transactionSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string(), // Adicionado para receber o ID do cofre
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

const updateGoalSchema = goalSchema.extend({
    id: z.string(),
});

const goalTransactionSchema = z.object({
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['deposit', 'withdrawal']),
  goalId: z.string(),
});

const deleteGoalSchema = z.object({
  id: z.string(),
});

const removeParticipantSchema = z.object({
  goalId: z.string(),
  participantId: z.string(),
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

const financialReportChatSchema = z.object({
    reportContext: z.string(),
    message: z.string(),
    chatHistory: z.string().optional(),
});

const generateReportSchema = z.object({
    month: z.string(),
    year: z.string(),
    ownerId: z.string(),
});


export type TransactionState = {
  message?: string | null;
  errors?: {
    id?: string[];
    ownerId?: string[];
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

export type UpdateGoalState = {
    message?: string | null;
    errors?: {
        id?: string[];
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
  reportHtml?: string | null;
  chatResponse?: string | null;
  isNewReport?: boolean;
  error?: string | null;
  message?: string | null;
};


export async function generateNewFinancialReport(prevState: FinancialReportState, formData: FormData): Promise<FinancialReportState> {
    const validatedFields = generateReportSchema.safeParse({
        month: formData.get('month'),
        year: formData.get('year'),
        ownerId: formData.get('ownerId'),
    });

    if (!validatedFields.success) {
        return { error: 'Dados inválidos para gerar o relatório.' };
    }

    const { month, year, ownerId } = validatedFields.data;
    
    const monthIndex = parseInt(month, 10) - 1;
    const yearNum = parseInt(year, 10);
    const monthName = new Date(yearNum, monthIndex).toLocaleString('pt-BR', { month: 'long' });
    const monthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${yearNum}`;
    const reportId = `${ownerId}-${yearNum}-${month}`;
    
    // 1. Check for cached report
    const cachedReport = savedReports.find(r => r.id === reportId);
    if (cachedReport) {
        return {
            reportHtml: cachedReport.analysisHtml,
            isNewReport: true,
            message: `Relatório para ${monthYear} carregado do cache.`
        };
    }

    const relevantTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.ownerId === ownerId && transactionDate.getMonth() === monthIndex && transactionDate.getFullYear() === yearNum;
    });

    if (relevantTransactions.length === 0) {
        const noDataHtml = `<div class="text-center py-10"><p class="text-muted-foreground">Nenhuma transação encontrada para ${monthYear}.</p></div>`;
        return {
             reportHtml: noDataHtml,
             isNewReport: true
        };
    }

    try {
        const result = await generateFinancialReport({
            month: monthYear,
            transactions: JSON.stringify(relevantTransactions, null, 2),
        });

        // 2. Save the new report to cache
        savedReports.push({
            id: reportId,
            ownerId,
            monthYear,
            analysisHtml: result.analysisHtml
        });

        return {
            reportHtml: result.analysisHtml,
            isNewReport: true, // Indica que um novo relatório foi gerado
        };
    } catch (error) {
        console.error('Error generating financial report:', error);
        return { error: 'Ocorreu um erro ao gerar o relatório. Tente novamente.' };
    }
}


export async function getFinancialReportChat(prevState: FinancialReportState, formData: FormData): Promise<FinancialReportState> {
  const validatedFields = financialReportChatSchema.safeParse({
    reportContext: formData.get('reportContext'),
    message: formData.get('message'),
    chatHistory: formData.get('chatHistory'),
  });

  if (!validatedFields.success) {
    return { ...prevState, error: 'Dados de chat inválidos.', isNewReport: false };
  }

  const { reportContext, message, chatHistory } = validatedFields.data;
  
  if (!reportContext || !message) {
      return { ...prevState, error: 'Contexto do relatório ou mensagem ausente.', isNewReport: false };
  }
  
  try {
    const result = await chatWithReport({
        reportContext: reportContext,
        question: message,
        chatHistory: chatHistory || '[]',
    });

    return {
        ...prevState,
        chatResponse: result.answer,
        isNewReport: false, // Indica que é uma resposta de chat
    };
  } catch (error) {
    console.error('Error calling GenAI chat flow:', error);
    return {
      ...prevState,
      error: 'Ocorreu um erro ao conversar com o assistente. Tente novamente.',
      isNewReport: false,
    };
  }
}


function invalidateReportCache(date: string | undefined, ownerId: string | undefined) {
    if (!date || !ownerId) return;

    const transactionDate = new Date(date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();
    const reportId = `${ownerId}-${year}-${month}`;
    
    const reportIndex = savedReports.findIndex(r => r.id === reportId);
    if (reportIndex > -1) {
        savedReports.splice(reportIndex, 1);
        console.log(`Cache for report ${reportId} invalidated.`);
    }
}


export async function addTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const validatedFields = transactionSchema.safeParse({
    ownerId: formData.get('ownerId'),
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
  
  const { ownerId, ...data } = validatedFields.data;
  const newTransaction = {
    id: (transactions.length + 1).toString(),
    date: data.date || new Date().toISOString(),
    ownerId: ownerId,
    ownerType: ownerId.startsWith('vault-') ? 'vault' : 'user',
    ...data
  };

  transactions.unshift(newTransaction);
  console.log('New transaction added:', newTransaction);
  
  invalidateReportCache(newTransaction.date, newTransaction.ownerId);

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/reports');
  revalidatePath(`/goals/${newTransaction.destinationAccountId}`);
  revalidatePath(`/goals/${newTransaction.sourceAccountId}`);

  return { message: 'Transação adicionada com sucesso!' };
}

export async function updateTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  // O ownerId não é editável, então não precisamos dele aqui.
  const validatedFields = transactionSchema.omit({ ownerId: true }).safeParse({
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
    const originalTransaction = transactions[index];
    transactions[index] = {
      ...originalTransaction,
      ...data,
      date: data.date || originalTransaction.date,
    };
    
    // Invalidate cache for both old and new date if date changed
    invalidateReportCache(originalTransaction.date, originalTransaction.ownerId);
    if(originalTransaction.date !== transactions[index].date) {
        invalidateReportCache(transactions[index].date, transactions[index].ownerId);
    }
    
    console.log(`Transaction with id ${id} updated.`);
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/reports');
    revalidatePath(`/goals/${originalTransaction.destinationAccountId}`);
    revalidatePath(`/goals/${originalTransaction.sourceAccountId}`);
    revalidatePath(`/goals/${transactions[index].destinationAccountId}`);
    revalidatePath(`/goals/${transactions[index].sourceAccountId}`);
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
    const deletedTransaction = transactions[index];
    invalidateReportCache(deletedTransaction.date, deletedTransaction.ownerId);
    transactions.splice(index, 1);
    console.log(`Transaction with id ${id} deleted.`);
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/reports');
    revalidatePath(`/goals/${deletedTransaction.destinationAccountId}`);
    revalidatePath(`/goals/${deletedTransaction.sourceAccountId}`);
  }

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

export async function updateGoal(prevState: UpdateGoalState, formData: FormData): Promise<UpdateGoalState> {
    const validatedFields = updateGoalSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        emoji: formData.get('emoji'),
        targetAmount: formData.get('targetAmount'),
        visibility: formData.get('visibility'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Falha na validação.',
        };
    }
    
    const { id, ...data } = validatedFields.data;

    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) {
        return { message: "Caixinha não encontrada." };
    }
    
    // Mock: update goal in memory
    goals[goalIndex] = {
        ...goals[goalIndex],
        ...data,
    };
    
    console.log(`Goal ${id} updated successfully.`);
    revalidatePath('/');
    revalidatePath(`/goals/${id}`);
    revalidatePath(`/goals/${id}/manage`);
    revalidatePath('/goals');

    return { message: "Caixinha atualizada com sucesso!" };
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
    const transactionDate = new Date().toISOString();
    invalidateReportCache(transactionDate, goal.ownerId);

    if (type === 'deposit') {
      goal.currentAmount += amount;
      transactions.unshift({
        id: (transactions.length + 1).toString(),
        date: transactionDate,
        description: `Depósito na caixinha: ${goal.name}`,
        amount,
        type: 'transfer',
        category: 'Caixinha',
        sourceAccountId: 'acc1', // Mock: assuming it comes from the main account
        destinationAccountId: goalId,
        ownerId: goal.ownerId,
        ownerType: goal.ownerType
      })

    } else {
      const newAmount = Math.max(0, goal.currentAmount - amount);
      const withdrawnAmount = goal.currentAmount - newAmount;
      goal.currentAmount = newAmount;

      transactions.unshift({
        id: (transactions.length + 1).toString(),
        date: transactionDate,
        description: `Retirada da caixinha: ${goal.name}`,
        amount: withdrawnAmount,
        type: 'transfer',
        category: 'Caixinha',
        sourceAccountId: goalId, 
        destinationAccountId: 'acc1', // Mock: assuming it goes to the main account
        ownerId: goal.ownerId,
        ownerType: goal.ownerType
      })
    }
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath(`/`);
  revalidatePath('/transactions');
  revalidatePath('/reports');


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

export async function removeParticipantFromGoal(formData: FormData) {
  const validatedFields = removeParticipantSchema.safeParse({
    goalId: formData.get('goalId'),
    participantId: formData.get('participantId'),
  });

  if (!validatedFields.success) {
    return { message: 'Dados inválidos.' };
  }

  const { goalId, participantId } = validatedFields.data;

  const goal = goals.find(g => g.id === goalId);
  if (!goal) {
    return { message: 'Caixinha não encontrada.' };
  }

  // Remove o participante da meta
  if (goal.participants) {
    goal.participants = goal.participants.filter(p => p.id !== participantId);
  }

  // Remove as transações associadas
  const transactionsToRemove = transactions.filter(t => 
    (t.destinationAccountId === goalId || t.sourceAccountId === goalId) && t.actorId === participantId
  );

  transactionsToRemove.forEach(tToRemove => {
    const index = transactions.findIndex(t => t.id === tToRemove.id);
    if (index > -1) {
      transactions.splice(index, 1);
    }
  });
  
  console.log(`Participant ${participantId} and their transactions removed from goal ${goalId}.`);
  
  revalidatePath(`/goals/${goalId}/manage`);
  revalidatePath(`/goals/${goalId}`);
  
  return { message: 'Participante removido com sucesso.' };
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
