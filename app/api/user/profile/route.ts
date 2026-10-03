import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Signed-in user's profile. */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Could not load profile.' }, { status: 503 });
  }
}

/** Update the signed-in user's display name. */
export async function PUT(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.data.name.trim() },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Could not update profile.' }, { status: 503 });
  }
}
