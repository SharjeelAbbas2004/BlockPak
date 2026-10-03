import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  subject: z.string().min(3, 'Please enter a subject.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

/**
 * Contact form endpoint.
 * Currently no mail provider is configured, so this returns a graceful
 * "not configured" state instead of silently dropping messages.
 * TODO: wire to an email provider (e.g. Resend) and persist to DB.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the form.' },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error:
        'Our contact form is not connected to an inbox yet. Please email us directly — details are on the Contact page.',
    },
    { status: 503 },
  );
}
