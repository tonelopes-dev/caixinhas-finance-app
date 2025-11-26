'use server';

import { z } from 'zod';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { passwordResetEmailTemplate } from '@/app/_templates/emails/password-reset-template';

const passwordResetSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

export type GenericState = {
    message?: string | null;
    errors?: {
        [key: string]: string[] | undefined;
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
    
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/password-reset?token=some-secure-token`;

    try {
        await sendEmail({
            to: validatedFields.data.email,
            subject: 'Redefinição de Senha - Caixinhas',
            body: passwordResetEmailTemplate(resetLink)
        });
        return { message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' };
    }
}
