
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendgrid';

export async function POST(request: Request) {
  try {
    const { fromEmail, fromName, subject, message } = await request.json();

    if (!fromEmail || !subject || !message) {
      return NextResponse.json({ error: 'Faltam campos obrigatórios (e-mail, assunto, mensagem).' }, { status: 400 });
    }

    const supportEmail = 'suporte@caixinhas.app'; // E-mail de destino do suporte

    const emailSent = await sendEmail({
      to: supportEmail,
      subject: `${subject} - De: ${fromName} (${fromEmail})`,
      html: `
        <p><strong>De:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
      text: `De: ${fromName} <${fromEmail}>\nAssunto: ${subject}\nMensagem:\n${message}`,
      replyTo: fromEmail, // Garante que a resposta vá para o usuário
    });

    if (emailSent) {
      return NextResponse.json({ message: 'Mensagem de suporte enviada com sucesso!' });
    } else {
      return NextResponse.json({ error: 'Falha ao enviar mensagem de suporte.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro na API de suporte:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
