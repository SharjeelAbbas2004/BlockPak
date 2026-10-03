import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations';
import { sendPasswordResetEmail, EmailNotConfiguredError } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

const RESET_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

function siteOrigin(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://web3pakistan.pk';
}

/**
 * Request a password-reset link. Always returns a generic success message
 * (no account enumeration); the reset email carries a signed, 1-hour,
 * single-purpose JWT — no reset-token table needed.
 *
 * Returns 503 { error: 'Email service not configured' } until an SMTP
 * provider is wired into lib/services/email.ts (token is logged in dev only).
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 },
    );
  }

  const genericReply = NextResponse.json({
    ok: true,
    message: 'If an account exists for this email, a password reset link has been sent.',
  });

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return genericReply;

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user || !user.passwordHash) return genericReply; // never reveal account existence

    const token = await encode({
      token: { sub: user.id, purpose: 'password-reset' },
      secret,
      maxAge: RESET_TOKEN_TTL_SECONDS,
    });
    const resetUrl = `${siteOrigin(req)}/reset-password?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({ to: user.email, resetUrl, userName: user.name });
    return genericReply;
  } catch (err) {
    if (err instanceof EmailNotConfiguredError) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Could not process your request.' }, { status: 503 });
  }
}
