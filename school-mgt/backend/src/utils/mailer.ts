import { env } from '../config/env';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

function esc(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Shared branded HTML shell for all outgoing emails. */
function emailShell(opts: {
  preheader?: string;
  eyebrow?: string;
  title: string;
  intro: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  accent?: string;
}): string {
  const accent = opts.accent || '#4f46e5';
  const accentDark = opts.accent === '#16a34a' ? '#15803d' : opts.accent === '#d97706' ? '#b45309' : opts.accent === '#dc2626' ? '#b91c1c' : '#4338ca';
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<tr><td align="center" style="padding:8px 0 4px"><a href="${esc(opts.ctaUrl)}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:10px">${esc(opts.ctaLabel)}</a></td></tr>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader || opts.intro)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%);padding:28px 14px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px">
        <tr><td style="padding:0 6px 14px">
          <div style="display:inline-block;background:${accent};color:#fff;font-weight:800;font-size:13px;letter-spacing:.08em;padding:8px 12px;border-radius:999px">SYNTAX SAAS</div>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,.08)">
            <tr><td style="background:linear-gradient(135deg,${accent} 0%,${accentDark} 100%);padding:28px 30px 24px">
              ${opts.eyebrow ? `<div style="color:rgba(255,255,255,.85);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">${esc(opts.eyebrow)}</div>` : ''}
              <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.2;font-weight:800">${esc(opts.title)}</h1>
            </td></tr>
            <tr><td style="padding:26px 30px 10px">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7">${opts.intro}</p>
              ${opts.bodyHtml || ''}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px">${cta}</table>
            </td></tr>
            <tr><td style="padding:18px 30px 26px">
              <div style="border-top:1px solid #e2e8f0;padding-top:16px;color:#64748b;font-size:12.5px;line-height:1.6">
                ${esc(opts.footerNote || 'This message was sent by Syntax SaaS. If you did not expect it, you can safely ignore it.')}
              </div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:16px 6px 0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} Syntax SaaS · School Management Platform</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function infoCard(rows: Array<[string, string]>, accent = '#4f46e5'): string {
  const body = rows.map(([k, v], i) =>
    `<tr><td style="padding:11px 14px;color:#475569;font-size:13px;font-weight:600;border-bottom:${i < rows.length - 1 ? '1px solid #e2e8f0' : '0'}">${esc(k)}</td><td style="padding:11px 14px;color:#0f172a;font-size:14px;font-weight:700;border-bottom:${i < rows.length - 1 ? '1px solid #e2e8f0' : '0'}">${esc(v)}</td></tr>`
  ).join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:14px 0 18px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;border-left:4px solid ${accent}"><tbody>${body}</tbody></table>`;
}

/**
 * Pluggable email transport. In this scaffold the transport simply logs the
 * message; wire a real provider (SendGrid, SES, Postmark, Resend, SMTP...) by
 * implementing `deliver()` and reading provider creds from env. The rest of the
 * codebase depends only on `sendMail`, so swapping providers is a one-file change.
 */
async function deliver(message: MailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'Syntax SaaS <support@innovempia.com>';
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
    console.error('[mail] delivery failed:', (err as Error).message);
  }
}

/** Teacher invitation with activation code and login details. */
export function sendTeacherOtpEmail(to: string, otp: string, schoolName: string, password?: string): Promise<void> {
  const rows: Array<[string, string]> = [['Email', to]];
  if (password) rows.push(['Password', password]);
  rows.push(['Activation code', otp]);
  return sendMail({
    to,
    subject: `Activate your ${schoolName} teacher account — Syntax SaaS`,
    html: emailShell({
      preheader: `Your activation code for ${schoolName} is ${otp}`,
      eyebrow: 'Teacher Invitation',
      title: `Welcome to ${schoolName}`,
      intro: `You’ve been invited to join <strong>${esc(schoolName)}</strong> on Syntax SaaS. Use the details below to sign in and activate your account.`,
      bodyHtml:
        infoCard(rows) +
        `<div style="margin:6px 0 14px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;color:#92400e;font-size:13.5px;line-height:1.6"><strong>Activation code:</strong> <span style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:22px;letter-spacing:4px;font-weight:800;color:#78350f">${esc(otp)}</span><br>This code expires in <strong>10 minutes</strong>.</div>`,
      footerNote: 'Keep your login details private. If you were not expecting this invitation, please ignore this email.',
    }),
    text:
      `You have been invited to join ${schoolName} on Syntax SaaS.\n\n` +
      `Login details:\nEmail: ${to}\n${password ? `Password: ${password}\n` : ''}` +
      `Activation code: ${otp}\nThis code expires in 10 minutes.`,
  });
}

/** Student/parent login credentials. */
export function sendStudentCredentials(to: string, studentId: string, password: string, schoolName: string): Promise<void> {
  return sendMail({
    to,
    subject: `Your ${schoolName} portal login details`,
    html: emailShell({
      preheader: `Student portal login details for ${schoolName}`,
      eyebrow: 'Student Portal Access',
      title: 'Your login details are ready',
      intro: `Your student account for <strong>${esc(schoolName)}</strong> has been set up. Use these credentials to access the Student/Parent portal.`,
      bodyHtml:
        infoCard([['School', schoolName], ['Student ID', studentId], ['Password', password]], '#0891b2') +
        `<p style="margin:0;color:#475569;font-size:13.5px;line-height:1.6">Keep these details safe. If you did not expect this message, contact your school administrator.</p>`,
      accent: '#0891b2',
      footerNote: 'For security, do not share your password with others.',
    }),
    text: `Welcome to ${schoolName}.\nStudent ID: ${studentId}\nPassword: ${password}`,
  });
}

/** School admin credentials issued when a school is onboarded. */
export function sendSchoolCredentials(
  to: string,
  schoolName: string,
  adminEmail: string,
  password: string,
): Promise<void> {
  return sendMail({
    to,
    subject: `Your ${schoolName} admin portal credentials`,
    html: emailShell({
      preheader: `Admin login credentials for ${schoolName}`,
      eyebrow: 'School Onboarding',
      title: `${schoolName} is ready to go`,
      intro: `Your school has been registered on Syntax SaaS. Use the credentials below to sign in to the <strong>School Admin</strong> portal and complete your setup.`,
      bodyHtml:
        infoCard([['School', schoolName], ['Admin email', adminEmail], ['Password', password]]) +
        `<div style="margin:6px 0 4px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;color:#92400e;font-size:13.5px;line-height:1.6"><strong>Important:</strong> Keep this password safe and change it after your first sign-in.</div>`,
      footerNote: 'If you did not expect this onboarding email, contact Syntax SaaS support.',
    }),
    text:
      `Welcome to ${schoolName}.\n\nA new school has been registered on Syntax SaaS.\n` +
      `School: ${schoolName}\nAdmin Email: ${adminEmail}\nPassword: ${password}\n\n` +
      `Keep this password safe. You will be asked to change it on first sign-in.`,
  });
}

/** Reminder to school admin to configure classes/subjects. */
export function sendAdminSetupReminder(
  adminEmail: string,
  schoolName: string,
  teacherName: string,
  teacherEmail: string,
): Promise<void> {
  return sendMail({
    to: adminEmail,
    subject: `Action needed: set up classes & subjects — ${schoolName}`,
    html: emailShell({
      preheader: `${teacherName} is waiting for classes & subjects to be configured`,
      eyebrow: 'Setup Reminder',
      title: 'Curriculum setup needed',
      intro: `<strong>${esc(teacherName)}</strong> (${esc(teacherEmail)}) signed in to the Teacher Portal for <strong>${esc(schoolName)}</strong>, but can’t enter scores yet because no classes or subjects are configured.`,
      bodyHtml:
        `<div style="margin:6px 0 14px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px">
          <div style="font-weight:800;color:#0f172a;margin-bottom:6px">What to do next</div>
          <ol style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.8">
            <li>Sign in to the <strong>School Admin</strong> portal</li>
            <li>Go to <strong>Classes &amp; Subjects</strong></li>
            <li>Create classes and assign subjects for your curriculum</li>
          </ol>
        </div>`,
      accent: '#d97706',
      footerNote: 'Once classes and subjects are configured, teachers can access their broadsheets.',
    }),
    text:
      `${teacherName} (${teacherEmail}) signed in to the Teacher Portal for ${schoolName}, but cannot proceed because no classes/subjects are configured.\n\n` +
      `Please sign in to the School Admin portal and set up Classes & Subjects (curriculum).`,
  });
}

/** Sent to the school admin when the owner confirms a subscription payment receipt. */
export function sendPaymentConfirmedEmail(
  to: string,
  schoolName: string,
  opts: { reference?: string; amount?: number; newExpiry?: Date },
): Promise<void> {
  const expiry = opts.newExpiry ? opts.newExpiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const rows: Array<[string, string]> = [['School', schoolName], ['Status', 'Active']];
  if (opts.reference) rows.push(['Payment reference', opts.reference]);
  if (typeof opts.amount === 'number' && opts.amount > 0) rows.push(['Amount', `₦${opts.amount.toLocaleString()}`]);
  if (expiry) rows.push(['Subscription active until', expiry]);
  return sendMail({
    to,
    subject: `Payment confirmed — ${schoolName} subscription is active`,
    html: emailShell({
      preheader: `Your payment was confirmed and ${schoolName} is active until ${expiry || 'your new renewal date'}.`,
      eyebrow: 'Subscription Update',
      title: 'Payment confirmed 🎉',
      intro: `Great news — the Syntax SaaS team has verified your bank transfer for <strong>${esc(schoolName)}</strong>. Your subscription is now <strong>active</strong>.`,
      bodyHtml:
        infoCard(rows, '#16a34a') +
        `<p style="margin:0;color:#334155;font-size:14px;line-height:1.7">You can continue using all school portal features without interruption. Thank you for your payment.</p>`,
      accent: '#16a34a',
      footerNote: 'If you have questions about this payment, please contact Syntax SaaS support.',
    }),
    text:
      `Payment confirmed for ${schoolName}.\n` +
      `${opts.reference ? `Reference: ${opts.reference}\n` : ''}` +
      `${typeof opts.amount === 'number' ? `Amount: ₦${opts.amount}\n` : ''}` +
      `${expiry ? `Subscription active until: ${expiry}\n` : ''}` +
      `Your subscription is now active.`,
  });
}
