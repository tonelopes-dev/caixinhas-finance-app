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
        .header { background: linear-gradient(135deg, #E7A42F 0%, #D4941F 100%); padding: 25px; text-align: center; }
        .logo-container { display: inline-block; vertical-align: middle; }
        .logo { width: 50px; height: 50px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); margin-right: 15px; vertical-align: middle; }
        .brand-name { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: -0.5px; vertical-align: middle; }
        .brand-tagline { color: #FFF8E6; font-size: 13px; margin: 5px 0 0 0; font-weight: 500; opacity: 0.9; }
        .greeting-section { padding: 35px 30px 20px 30px; background-color: #ffffff; border-bottom: 2px solid #F0F0F0; margin-bottom: 25px; text-align: center; }
        .greeting-title { color: #453C35; font-size: 26px; margin: 0; font-weight: 600; }
        .greeting-highlight { color: #E7A42F; }
        .content { padding: 0 30px 30px 30px; }
        .content h2 { font-size: 24px; color: #E7A42F; }
        .content p { font-size: 16px; line-height: 1.6; }
        .button { display: inline-block; background-color: #d4ac0d; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #f3f0e9; padding: 20px; text-align: center; font-size: 12px; color: #8e8073; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="https://caixinhas-finance-app.s3.us-east-1.amazonaws.com/logo-caixinhas.png" alt="Caixinhas Logo" class="logo">
            <h1 class="brand-name">Caixinhas</h1>
          </div>
          <p class="brand-tagline">Sua vida financeira organizada</p>
        </div>
        <div class="greeting-section">
          <h2 class="greeting-title">Olá, <span class="greeting-highlight">${userName}</span>! 👋</h2>
        </div>
        <div class="content">
          <h2>Bem-vindo(a) à nossa família!</h2>
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
