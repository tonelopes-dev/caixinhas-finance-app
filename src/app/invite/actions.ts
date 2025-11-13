'use server';

import { z } from 'zod';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { inviteEmailTemplate } from '@/app/_templates/emails/invite-template';
import { user } from '@/lib/data';
import type { GenericState } from '@/app/auth/actions';


const inviteSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  vaultName: z.string(), // Adicionado para incluir o nome do cofre no convite
});

export async function sendPartnerInvite(prevState: GenericState, formData: FormData): Promise<GenericState> {
    const validatedFields = inviteSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Falha na validação.',
        };
    }
    
    const { email, vaultName } = validatedFields.data;
    
    try {
        await sendEmail({
            to: email,
            subject: `Você foi convidado(a) para o cofre "${vaultName}" no Caixinhas!`,
            body: inviteEmailTemplate(user.name, vaultName)
        });
        return { message: 'Convite enviado com sucesso!' };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { message: 'Ocorreu um erro ao enviar o convite. Tente novamente.' };
    }
}
