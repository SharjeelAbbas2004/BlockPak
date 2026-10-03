/**
 * Password-reset email service — STUB.
 *
 * CURRENT STATE: No email transport is wired up. This module defines the
 * interface the rest of the app programs against so a real provider
 * (Nodemailer/SMTP, Resend, SendGrid, …) can be dropped in later without
 * touching the API routes.
 *
 * BEHAVIOUR:
 * - If SMTP is not configured (requires SMTP_HOST and EMAIL_FROM env vars),
 *   `sendPasswordResetEmail()` throws `EmailNotConfiguredError`. The
 *   /api/auth/forgot-password route catches it and responds with
 *   `503 { error: 'Email service not configured' }`.
 * - The reset token is logged to the server console ONLY in non-production
 *   (dev) so the flow can still be tested locally. It is NEVER included in an
 *   API response and NEVER logged in production.
 *
 * TO ENABLE REAL EMAILS:
 * 1. Set SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASS) and EMAIL_FROM in .env.
 * 2. Implement the transport inside sendPasswordResetEmail() below.
 */

export class EmailNotConfiguredError extends Error {
  constructor() {
    super('Email service not configured');
    this.name = 'EmailNotConfiguredError';
  }
}

export interface PasswordResetEmailInput {
  to: string;
  resetUrl: string;
  userName?: string | null;
}

const isDev = process.env.NODE_ENV !== 'production';

function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM);
}

/**
 * Send a password-reset email containing the reset link.
 * @throws {EmailNotConfiguredError} when SMTP/EMAIL_FROM are not configured.
 */
export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  if (!isEmailConfigured()) {
    // Dev-only: print the link so the flow is testable without an SMTP server.
    // Never log this in production; never return the token to the client.
    if (isDev) {
      console.warn(
        `[email-stub] SMTP not configured — password reset link for ${input.to}:\n${input.resetUrl}`,
      );
    }
    throw new EmailNotConfiguredError();
  }

  // TODO: wire a real transport here (e.g. Nodemailer with SMTP_HOST/SMTP_PORT/
  // SMTP_USER/SMTP_PASS, or a provider SDK). Send an HTML email to `input.to`
  // from process.env.EMAIL_FROM containing `input.resetUrl` (1-hour expiry).
  if (isDev) {
    console.info(`[email-stub] would send password-reset email to ${input.to}`);
  }
}
