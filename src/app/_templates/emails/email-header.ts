
export const emailHeader = (userName: string) => `
  <div style="font-family: 'Inter', 'Alegreya', sans-serif; line-height: 1.6; color: #453C35; background-color: #F2F1E4; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F1E4;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="text-align: center; padding: 20px;">
                <img src="https://caixinhas-finance-app.s3.us-east-1.amazonaws.com/logo-caixinhas.png" alt="Caixinhas App Logo" style="width: 150px; height: auto; display: block; margin: 0 auto;">
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h1 style="font-family: 'Alegreya', serif; color: #E7A42F; font-size: 28px; margin-bottom: 20px; text-align: center;">Olá, ${userName}!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <!-- O conteúdo específico do e-mail virá aqui -->
`