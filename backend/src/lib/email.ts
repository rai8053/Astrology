import { logger } from './logger.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@somasurya.com';

let resendClient: any = null;

async function getClient() {
  if (!RESEND_API_KEY) return null;
  if (!resendClient) {
    const { Resend } = await import('resend');
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const client = await getClient();
  if (!client) {
    logger.warn('RESEND_API_KEY not configured — skipping welcome email');
    return;
  }
  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Soma & Surya — Your Cosmic Journey Begins',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#d4af37;margin:0 0 8px">Welcome, ${name}!</h1>
        <p style="color:#333;line-height:1.6">Thank you for joining Soma & Surya. Your personalized Vedic astrology journey begins now.</p>
        <p style="color:#333;line-height:1.6">Explore your birth chart, daily horoscope, compatibility matches, and chat with our AI astrologer.</p>
        <a href="https://somasurya.com/dashboard" style="display:inline-block;background:#d4af37;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;margin-top:16px">Go to Dashboard</a>
        <p style="color:#888;font-size:12px;margin-top:24px">— The Soma & Surya Team</p>
      </div>`,
    });
    logger.info({ to }, 'Welcome email sent');
  } catch (err) {
    logger.error({ err, to }, 'Failed to send welcome email');
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const client = await getClient();
  if (!client) {
    logger.warn('RESEND_API_KEY not configured — skipping password reset email');
    return;
  }
  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset Your Soma & Surya Password',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#d4af37;margin:0 0 8px">Password Reset</h1>
        <p style="color:#333;line-height:1.6">Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="display:inline-block;background:#d4af37;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;margin-top:16px">Reset Password</a>
        <p style="color:#888;font-size:12px;margin-top:24px">If you did not request this, please ignore this email.</p>
      </div>`,
    });
    logger.info({ to }, 'Password reset email sent');
  } catch (err) {
    logger.error({ err, to }, 'Failed to send password reset email');
  }
}
