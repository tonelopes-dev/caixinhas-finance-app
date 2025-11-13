

"use server";

// Este arquivo foi refatorado. A maior parte da sua lógica foi movida
// para arquivos de ação específicos de cada domínio (ex: /transactions/actions.ts).

// Ações globais ou que ainda não foram migradas podem permanecer aqui.

import { sendEmail } from '@/ai/flows/send-email-flow';
import { inviteEmailTemplate } from '@/app/_templates/emails/invite-template';
import { user } from '@/lib/data';


export async function sendGoalInvite(email: string, goalName: string): Promise<{message: string}> {
    if(!email) return { message: 'E-mail inválido.'};
    
    try {
        await sendEmail({
            to: email,
            subject: `Você foi convidado(a) para a caixinha "${goalName}"`,
            body: inviteEmailTemplate(user.name, goalName) // Reutilizando o template de convite de cofre por simplicidade
        });
        return { message: 'Convite enviado com sucesso!' };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { message: 'Ocorreu um erro ao enviar o convite. Tente novamente.' };
    }
}
