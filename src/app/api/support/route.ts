
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendgrid';

export async function POST(request: Request) {
  try {
    // Verificar se o content-type é FormData
    const contentType = request.headers.get('content-type') || '';
    
    let fromEmail: string;
    let fromName: string;
    let subject: string;
    let message: string;
    let attachment: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Processar FormData (com possível anexo)
      const formData = await request.formData();
      
      fromEmail = formData.get('fromEmail') as string;
      fromName = formData.get('fromName') as string;
      subject = formData.get('subject') as string;
      message = formData.get('message') as string;
      attachment = formData.get('attachment') as File;
      
    } else {
      // Processar JSON (sem anexo)
      const data = await request.json();
      fromEmail = data.fromEmail;
      fromName = data.fromName;
      subject = data.subject;
      message = data.message;
    }

    if (!fromEmail || !subject || !message) {
      return NextResponse.json({ error: 'Faltam campos obrigatórios (e-mail, assunto, mensagem).' }, { status: 400 });
    }

    const supportEmail = 'suporte@caixinhas.app'; // E-mail de destino do suporte

    // Preparar conteúdo do email
    let emailHtml = `
      <p><strong>De:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
      <p><strong>Assunto:</strong> ${subject}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    let emailText = `De: ${fromName} <${fromEmail}>\nAssunto: ${subject}\nMensagem:\n${message}`;

    // Adicionar informação sobre anexo se houver
    if (attachment && attachment.size > 0) {
      emailHtml += `<p><strong>Anexo:</strong> ${attachment.name} (${(attachment.size / 1024 / 1024).toFixed(2)} MB)</p>`;
      emailText += `\n\nAnexo: ${attachment.name} (${(attachment.size / 1024 / 1024).toFixed(2)} MB)`;
    }

    const emailOptions = {
      to: supportEmail,
      subject: `${subject} - De: ${fromName} (${fromEmail})`,
      html: emailHtml,
      text: emailText,
      replyTo: fromEmail,
    };

    // Se houver anexo, converter para base64 e adicionar
    if (attachment && attachment.size > 0) {
      const arrayBuffer = await attachment.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      (emailOptions as any).attachments = [{
        content: base64,
        filename: attachment.name,
        type: attachment.type,
        disposition: 'attachment'
      }];
    }

    const emailSent = await sendEmail(emailOptions);

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
