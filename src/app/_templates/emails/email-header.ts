export const emailHeader = (userName: string) => `
  <div style="font-family: 'Inter', 'Alegreya', Arial, sans-serif; line-height: 1.6; color: #453C35; background-color: #F8F6F0; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8F6F0;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; border-collapse: separate; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="background: #F4D89C; background: linear-gradient(135deg, #F4D89C 0%, #F0C678 100%); padding: 30px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="padding-right: 15px; vertical-align: middle;">
                      <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; width: 55px; height: 55px;">
                        <tr>
                          <td align="center" valign="middle" style="line-height: 55px;">
                            <img src="https://caixinhas-finance-app.s3.us-east-1.amazonaws.com/logo-caixinhas.png"
                             alt="Logo" width="40" style="display: block; border: 0; vertical-align: middle;">
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="vertical-align: middle; text-align: left;">
                      <h1 style="font-family: 'Alegreya', serif; color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: -0.5px;">Caixinhas</h1>
                      <p style="font-family: 'Inter', sans-serif; color: #FFF8E6; font-size: 13px; margin: 0; font-weight: 500; opacity: 0.9;">Sua vida financeira organizada</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
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
              <td style="padding: 0 30px 30px 30px; background-color: #ffffff;">
                `;