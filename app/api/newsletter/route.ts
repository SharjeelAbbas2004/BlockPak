import { NextRequest, NextResponse } from 'next/server';
import { subscriberSchema } from '@/lib/validations';
import { subscribeEmail } from '@/lib/services/newsletter';

export const dynamic = 'force-dynamic';

/** Newsletter subscription endpoint. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = subscriberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid email address.' },
      { status: 400 },
    );
  }

  try {
    await subscribeEmail(parsed.data.email, parsed.data.name);
    return NextResponse.json({ ok: true, message: 'Subscribed successfully.' });
  } catch {
    return NextResponse.json(
      { error: 'Subscription is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }
}
