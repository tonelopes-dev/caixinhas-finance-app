'use server';
/**
 * @fileOverview An email sending flow using SendGrid.
 *
 * - sendEmail - A function that handles sending an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail as coreSendEmail } from '@/lib/email.service';

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
    try {
      const success = await coreSendEmail({
        to: input.to,
        subject: input.subject,
        html: input.body,
      });
      
      if (success) {
        console.log(`Email sent to ${input.to} via Resend flow`);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to send email.' };
      }
    } catch (error: any) {
      console.error('Error sending email with Resend flow:', error);
      return { success: false, error: error.message || 'Failed to send email.' };
    }
  }
);
