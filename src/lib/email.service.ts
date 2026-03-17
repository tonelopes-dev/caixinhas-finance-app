import { Resend } from 'resend';

export interface EmailAttachment {
  content: string; // base64 encoded content
  filename: string;
  type: string;
  disposition: 'attachment' | 'inline';
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Serviço de e-mail agnóstico utilizando Resend.
 * Substitui a implementação anterior do SendGrid mantendo os contratos.
 */
export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text, replyTo, attachments } = options;

  try {
    const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY não configurada. Email não será enviado.');
      return false;
    }

    const resend = new Resend(apiKey);

    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'suporte@caixinhas.app';
    const fromName = process.env.RESEND_FROM_NAME || process.env.SENDGRID_FROM_NAME || 'Caixinhas App';

    // O Resend espera o remetente no formato "Nome <email@dominio.com>"
    const from = `${fromName} <${fromEmail}>`;

    console.log('📧 Configurações de email (Resend):');
    console.log('   📨 Para:', to);
    console.log('   📝 Assunto:', subject);
    console.log('   👤 De:', from);
    
    if (replyTo) {
      console.log('   ↩️ Responder Para:', replyTo);
    }

    const resendPayload: any = {
      from,
      to: [to],
      subject,
      html,
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    };

    if (replyTo) {
      resendPayload.reply_to = replyTo;
    }

    if (attachments && attachments.length > 0) {
      console.log('   📎 Anexos:', attachments.length);
      resendPayload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content, // O Resend aceita base64 string no campo content
        contentType: att.type,
      }));
      
      attachments.forEach((att, index) => {
        console.log(`     ${index + 1}. ${att.filename} (${att.type})`);
      });
    }

    const { data, error } = await resend.emails.send(resendPayload);

    if (error) {
      console.error('❌ Erro da API do Resend:', error);
      throw new Error(`Falha ao enviar email via Resend: ${error.message}`);
    }

    console.log('✅ Email enviado com sucesso via Resend!');
    console.log('📊 ID do Email:', data?.id);
    return true;

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw new Error(`Falha ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export default sendEmail;
