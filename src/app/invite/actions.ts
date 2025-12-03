
'use server';

import { z } from 'zod';
import { VaultService } from '@/services/vault.service';
import type { GenericState } from '@/app/auth/actions';

const inviteSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  vaultId: z.string().min(1, { message: 'Selecione um cofre para convidar.' }),
  userId: z.string().min(1, { message: 'ID do usuário remetente não encontrado.' }),
});

export async function getVaultMembers(vaultId: string) {
  try {
    const vault = await VaultService.getVaultById(vaultId);
    return vault?.members || [];
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    return [];
  }
}

export async function sendPartnerInvite(
  prevState: GenericState,
  formData: FormData
): Promise<GenericState> {

  const validatedFields = inviteSchema.safeParse({
    email: formData.get('email'),
    vaultId: formData.get('vaultId'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação.',
    };
  }

  const { email: receiverEmail, vaultId, userId: senderId } = validatedFields.data;

  try {
    await VaultService.createInvitation(vaultId, senderId, receiverEmail);
    // O envio de e-mail pode ser acionado aqui ou dentro do service.
    // Por enquanto, o foco é na lógica do banco de dados.

    return { message: 'Convite enviado com sucesso e registrado no sistema!' };
  } catch (error: any) {
    // Erros de regra de negócio conhecidos não precisam de log de erro crítico
    const isKnownError = error.message.includes('já é membro') || 
                        error.message.includes('convite pendente') || 
                        error.message.includes('não encontrado');

    if (!isKnownError) {
        console.error("Erro ao criar convite:", error);
    }
    
    // Retornar mensagens de erro mais específicas
    if (error.message.includes('já é membro')) {
      return { 
        message: 'Este usuário já faz parte deste cofre. Não é necessário enviar convite.',
        errors: { email: ['Este e-mail já pertence a um membro do cofre'] }
      };
    }
    
    if (error.message.includes('convite pendente')) {
      return { 
        message: 'Já existe um convite pendente para este usuário neste cofre.',
        errors: { email: ['Convite já enviado anteriormente'] }
      };
    }
    
    if (error.message.includes('não encontrado')) {
      return { 
        message: 'Usuário não encontrado. Peça para ele(a) se cadastrar primeiro.',
        errors: { email: ['E-mail não cadastrado no sistema'] }
      };
    }
    
    return { message: error.message || 'Ocorreu um erro ao enviar o convite. Tente novamente.' };
  }
}

// Funções para gerenciar convites
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';

export async function getUserInvitations() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const invitations = await VaultService.getUserInvitations(session.user.id);
  return invitations;
}

export async function deleteInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  await VaultService.deleteInvitation(invitationId, session.user.id);
  revalidatePath('/invite');
}

export async function getUserSentInvitations() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const invitations = await VaultService.getUserSentInvitations(session.user.id);
  return invitations;
}

export async function cancelInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  await VaultService.cancelInvitation(invitationId, session.user.id);
  revalidatePath('/invite');
}

export async function respondToInvitation(invitationId: string, action: 'accept' | 'decline') {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  if (action === 'accept') {
    await VaultService.acceptInvitation(invitationId, session.user.id);
  } else {
    await VaultService.declineInvitation(invitationId, session.user.id);
  }
  
  revalidatePath('/invite');
}
