import { Resend } from 'resend';

// Load API key from environment variable or fallback placeholder
const resendApiKey = process.env.RESEND_API_KEY || 're_xxxxxxxxx';
export const resend = new Resend(resendApiKey);

export interface SendEmailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail({
  from = process.env.RESEND_FROM || 'onboarding@resend.dev',
  to,
  subject,
  html = '<p>Congrats on sending your <strong>first email</strong>!</p>',
  text,
}: SendEmailOptions) {
  return await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });
}
