import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { preferencesSchema } from '@/lib/validations';
import { normalizeAlertPrefs } from '@/lib/preferences';

export const dynamic = 'force-dynamic';

async function requireUser(): Promise<{ id: string; email: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return null;
  return { id: session.user.id, email: session.user.email };
}

/** Newsletter opt-in + Pakistan crypto-regulation alert preferences. */
export async function GET() {
  const me = await requireUser();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: { newsletterOptIn: true, alertPrefs: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    return NextResponse.json({
      newsletterOptIn: user.newsletterOptIn,
      alertPrefs: normalizeAlertPrefs(user.alertPrefs),
    });
  } catch {
    return NextResponse.json({ error: 'Could not load preferences.' }, { status: 503 });
  }
}

/** Save newsletter opt-in + alert preferences; mirrors them to the subscriber list. */
export async function PUT(req: NextRequest) {
  const me = await requireUser();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 },
    );
  }

  const { newsletterOptIn, alertPrefs } = parsed.data;

  try {
    await prisma.user.update({
      where: { id: me.id },
      data: { newsletterOptIn, alertPrefs },
    });

    // Keep the newsletter subscriber record in sync so sends respect the opt-in.
    await prisma.newsletterSubscriber.upsert({
      where: { email: me.email.toLowerCase() },
      update: { isActive: newsletterOptIn, preferences: alertPrefs },
      create: { email: me.email.toLowerCase(), isActive: newsletterOptIn, preferences: alertPrefs },
    });

    return NextResponse.json({ newsletterOptIn, alertPrefs });
  } catch {
    return NextResponse.json({ error: 'Could not save preferences.' }, { status: 503 });
  }
}
