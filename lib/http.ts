/** Shared helpers for JSON API routes. */
import { NextRequest, NextResponse } from 'next/server';
import type { ZodError } from 'zod';

export async function readJson(
  req: NextRequest,
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    const body: unknown = await req.json();
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }),
    };
  }
}

export function validationError(error: ZodError): NextResponse {
  return NextResponse.json(
    { error: error.issues[0]?.message ?? 'Invalid input.' },
    { status: 400 },
  );
}
