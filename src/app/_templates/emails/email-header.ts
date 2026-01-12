
export const emailHeader = (userName: string) => `
  <div style="font-family: 'Inter', 'Alegreya', sans-serif; line-height: 1.6; color: #453C35; background-color: #F8F6F0; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8F6F0;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Cabeçalho criativo com logo + nome -->
            <tr>
              <td style="background: linear-gradient(135deg, #F4D89C 0%, #F0C678 100%); padding: 25px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 15px;">
                      <!-- Logo como emoji para garantir visibilidade universal -->
                      <div style="width: 50px; height: 50px; background-color: #ffffff; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                        🎁
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <h1 style="font-family: 'Alegreya', serif; color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: -0.5px;">Caixinhas</h1>
                      <p style="font-family: 'Inter', sans-serif; color: #FFF8E6; font-size: 13px; margin: 0; font-weight: 500; opacity: 0.9;">Sua vida financeira organizada</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Saudação personalizada -->
            <tr>
              <td style="padding: 35px 30px 20px 30px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 2px solid #F5F2ED; padding-bottom: 25px; margin-bottom: 25px;">
                  <h2 style="font-family: 'Alegreya', serif; color: #453C35; font-size: 26px; margin: 0; font-weight: 600;">
                    Olá, <span style="color: #D4A574;">${userName}</span>! 👋
                  </h2>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <!-- O conteúdo específico do e-mail virá aqui -->
`