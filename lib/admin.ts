/**
 * Admin authorization guard for API routes.
 *
 * Usage:
 *   const gate = await requireAdmin();
 *   if ('error' in gate) return gate.error;
 *   // gate.session is a logged-in ADMIN session here
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from './auth';

type GateOk = { session: Session };
type GateDenied = { error: NextResponse };

export async function requireAdmin(): Promise<GateOk | GateDenied> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  }
  return { session };
}
