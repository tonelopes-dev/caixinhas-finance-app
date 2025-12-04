"use server";

// Este arquivo foi refatorado. A maior parte da sua lógica foi movida
// para arquivos de ação específicos de cada domínio (ex: /transactions/actions.ts).

// Ações globais ou que ainda não foram migradas podem permanecer aqui.

import { sendEmail } from '@/ai/flows/send-email-flow';
import { inviteEmail } from '@/app/_templates/emails/invite-template';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function sendGoalInvite(email: string, goalName: string): Promise<{message: string}> {
    if(!email) return { message: 'E-mail inválido.'};
    
    try {
        const session = await getServerSession(authOptions);
        const senderName = session?.user?.name || 'Um usuário do Caixinhas';

        await sendEmail({
            to: email,
            subject: `Você foi convidado(a) para a caixinha "${goalName}"`,
            body: inviteEmail(senderName, goalName, '#') // TODO: Adicionar link de convite real
        });
        return { message: 'Convite enviado com sucesso!' };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { message: 'Ocorreu um erro ao enviar o convite. Tente novamente.' };
    }
}
