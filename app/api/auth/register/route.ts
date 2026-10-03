import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Public user registration. Creates a USER-role account. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email: normalizedEmail, passwordHash, role: 'USER' },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Registration is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }
}
