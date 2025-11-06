/**
 * Gera o template HTML para o e-mail de redefinição de senha.
 * @param resetLink O link para a página de redefinição de senha.
 * @returns A string HTML do e-mail.
 */
export const passwordResetEmailTemplate = (resetLink: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha - Caixinhas</title>
       <style>
        body { font-family: 'Alegreya', serif; background-color: #fcfaf4; color: #443831; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e0d4; border-radius: 12px; overflow: hidden; }
        .header { background-color: #f7eecf; padding: 40px; text-align: center; }
        .header h1 { color: #d4ac0d; font-size: 32px; margin: 0; }
        .content { padding: 30px; }
        .content h2 { font-size: 24px; color: #d4ac0d; }
        .content p { font-size: 16px; line-height: 1.6; }
        .button { display: inline-block; background-color: #d4ac0d; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #f3f0e9; padding: 20px; text-align: center; font-size: 12px; color: #8e8073; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Caixinhas</h1>
        </div>
        <div class="content">
          <h2>Redefinir sua senha</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Caixinhas.</p>
          <p>Se foi você, clique no botão abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
          <a href="${resetLink}" class="button">Redefinir Senha</a>
          <p style="margin-top: 30px;">Se você não solicitou essa alteração, pode ignorar este e-mail com segurança.</p>
          <p>Com carinho,<br>Equipe Caixinhas</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Caixinhas. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
