'use server';
/**
 * @fileOverview An email sending flow using SendGrid.
 *
 * - sendEmail - A function that handles sending an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import sgMail from '@sendgrid/mail';

const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean; error?: string }> {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set.');
      return { success: false, error: 'SendGrid API key is not configured.' };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: input.to,
      // IMPORTANT: This 'from' email must be a verified sender in your SendGrid account.
      from: 'suporte@dreamvault.com', 
      subject: input.subject,
      html: input.body,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${input.to}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending email with SendGrid:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      return { success: false, error: 'Failed to send email.' };
    }
  }
);
