import { NextRequest, NextResponse } from 'next/server';
import { decode } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * Complete a password reset. Verifies the signed, 1-hour, single-purpose JWT
 * issued by /api/auth/forgot-password, then replaces the user's password hash.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 },
    );
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Password reset is unavailable.' }, { status: 503 });
  }

  let userId: string;
  try {
    const decoded = await decode({ token: parsed.data.token, secret });
    if (!decoded || decoded.purpose !== 'password-reset' || typeof decoded.sub !== 'string') {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 },
      );
    }
    userId = decoded.sub;
  } catch {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Please request a new one.' },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return NextResponse.json({ ok: true, message: 'Your password has been reset. You can now sign in.' });
  } catch {
    return NextResponse.json({ error: 'Could not reset your password.' }, { status: 503 });
  }
}
