/**
 * Gera o template HTML para o e-mail de boas-vindas.
 * @param userName O nome do novo usuário.
 * @returns A string HTML do e-mail.
 */
export const welcomeEmailTemplate = (userName: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo(a) ao Caixinhas!</title>
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
          <p style="color: #8e8073; font-size: 16px; margin-top: 5px;">Sonhar juntos é o primeiro passo para conquistar.</p>
        </div>
        <div class="content">
          <h2>Bem-vindo(a), ${userName}!</h2>
          <p>Sua jornada para realizar sonhos em conjunto começa agora. Estamos muito felizes por ter você a bordo.</p>
          <p>O Caixinhas foi criado para transformar a maneira como você e seu parceiro(a) lidam com as finanças, tornando tudo mais transparente, colaborativo e, acima de tudo, motivador.</p>
          <p>Pronto(a) para começar a planejar seu futuro?</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/login" class="button">Acessar minha conta</a>
          <p style="margin-top: 30px;">Com carinho,<br>Equipe Caixinhas</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Caixinhas. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
