import { env } from '../config/env';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Pluggable email transport. In this scaffold the transport simply logs the
 * message; wire a real provider (SendGrid, SES, Postmark, Resend, SMTP...) by
 * implementing `deliver()` and reading provider creds from env. The rest of the
 * codebase depends only on `sendMail`, so swapping providers is a one-file change.
 */
async function deliver(message: MailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'support@innovempia.com';
  if (apiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: message.to, subject: message.subject, text: message.text, html: message.html }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return;
  }
  if (env.isProduction) {
    console.warn(`[mail] No provider configured; email to ${message.to} was NOT sent.`);
    return;
  }
  console.log(`[mail] (dev) to=${message.to} subject="${message.subject}"\n${message.text}`);
}

export async function sendMail(message: MailMessage): Promise<void> {
  try {
    await deliver(message);
  } catch (err) {
    // Never let a mail failure break the primary action (e.g. inviting a teacher).
    // eslint-disable-next-line no-console
    console.error('[mail] delivery failed:', (err as Error).message);
  }
}

/**
 * Convenience template for teacher invitation OTPs.
 */
export function sendTeacherOtpEmail(to: string, otp: string, schoolName: string): Promise<void> {
  return sendMail({
    to,
    subject: 'Your Syntax SaaS teacher activation code',
    text:
      `You have been invited to join ${schoolName} on Syntax SaaS.\n\n` +
      `Your activation code is: ${otp}\n` +
      `This code expires in 10 minutes.`,
  });
}
