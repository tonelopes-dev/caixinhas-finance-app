'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VaultService } from '@/services';
import type { GenericState } from '@/app/auth/actions';

const inviteSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  vaultId: z.string().min(1, { message: 'Selecione um cofre para convidar.' }),
});

export async function sendPartnerInvite(
  prevState: GenericState,
  formData: FormData
): Promise<GenericState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { message: 'Usuário não autenticado.' };
  }

  const validatedFields = inviteSchema.safeParse({
    email: formData.get('email'),
    vaultId: formData.get('vaultId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação.',
    };
  }

  const { email: receiverEmail, vaultId } = validatedFields.data;

  try {
    await VaultService.createInvitation(vaultId, session.user.id, receiverEmail);
    // O envio de e-mail pode ser acionado aqui ou dentro do service.
    // Por enquanto, o foco é na lógica do banco de dados.

    return { message: 'Convite enviado com sucesso e registrado no sistema!' };
  } catch (error: any) {
    console.error("Erro ao criar convite:", error);
    return { message: error.message || 'Ocorreu um erro ao enviar o convite. Tente novamente.' };
  }
}
