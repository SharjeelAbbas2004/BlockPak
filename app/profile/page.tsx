import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { UserRound, Mail, ShieldCheck } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import ProfileForm from '@/components/user/ProfileForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Your profile' };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login?callbackUrl=/profile');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect('/login?callbackUrl=/profile');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-zinc-100">
        <UserRound className="h-6 w-6 text-accent" /> Your profile
      </h1>

      <div className="mt-6 space-y-4 rounded-xl border border-border bg-surface/60 p-6">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">Name</p>
          <ProfileForm initialName={user.name} />
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">Email</p>
          <p className="flex items-center gap-2 text-sm text-zinc-200">
            <Mail className="h-4 w-4 text-muted" /> {user.email}
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">Role</p>
          <p className="flex items-center gap-2 text-sm text-zinc-200">
            <ShieldCheck className="h-4 w-4 text-muted" />
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
              {user.role}
            </span>
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">
            Member since
          </p>
          <p className="text-sm text-zinc-200">{formatDate(user.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
