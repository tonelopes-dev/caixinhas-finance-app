
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
    console.error("Erro ao criar convite:", error);
    
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
