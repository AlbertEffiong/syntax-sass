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
export function sendTeacherOtpEmail(to: string, otp: string, schoolName: string, password?: string): Promise<void> {
  return sendMail({
    to,
    subject: 'Your Syntax SaaS teacher activation code',
    html:
      `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">` +
      `<h2 style="color:#4f46e5">Welcome to ${schoolName}</h2>` +
      `<p>You have been invited to join <strong>${schoolName}</strong> on Syntax SaaS.</p>` +
      `<p><strong>Your login details:</strong></p>` +
      `<ul><li>Email: ${to}</li>${password ? `<li>Password: ${password}</li>` : ''}</ul>` +
      `<p><strong>Activation code:</strong> <span style="font-size:20px;letter-spacing:4px">${otp}</span></p>` +
      `<p>This code expires in 10 minutes.</p></div>`,
    text:
      `You have been invited to join ${schoolName} on Syntax SaaS.\n\n` +
      `Login details:\nEmail: ${to}\n${password ? `Password: ${password}\n` : ''}` +
      `Activation code: ${otp}\n` +
      `This code expires in 10 minutes.`,
  });
}


export function sendStudentCredentials(to: string, studentId: string, password: string, schoolName: string): Promise<void> {
  return sendMail({
    to,
    subject: `Your ${schoolName} student login details`,
    html:
      `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">` +
      `<h2 style="color:#4f46e5">Welcome to ${schoolName}</h2>` +
      `<p>Your student account has been created.</p>` +
      `<ul><li>Student ID: ${studentId}</li><li>Password: ${password}</li></ul></div>`,
    text: `Welcome to ${schoolName}.\nStudent ID: ${studentId}\nPassword: ${password}`,
  });
}

/**
 * Email template used when the SaaS owner onboards a new school. The admin
 * password is generated server-side and emailed — never stored in plaintext.
 */
export function sendSchoolCredentials(
  to: string,
  schoolName: string,
  adminEmail: string,
  password: string,
): Promise<void> {
  return sendMail({
    to,
    subject: `Your ${schoolName} admin login credentials`,
    html:
      `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">` +
      `<h2 style="color:#4f46e5">Welcome to ${schoolName}</h2>` +
      `<p>A new school has been registered on Syntax SaaS. Use these credentials to sign in to the School Admin portal.</p>` +
      `<ul><li>School: ${schoolName}</li><li>Admin Email: ${adminEmail}</li><li>Password: ${password}</li></ul>` +
      `<p style="color:#b45309"><strong>Keep this password safe.</strong> You will be asked to change it on first sign-in.</p></div>`,
    text:
      `Welcome to ${schoolName}.\n\n` +
      `A new school has been registered on Syntax SaaS.\n` +
      `School: ${schoolName}\n` +
      `Admin Email: ${adminEmail}\n` +
      `Password: ${password}\n\n` +
      `Keep this password safe. You will be asked to change it on first sign-in.`,
  });
}
