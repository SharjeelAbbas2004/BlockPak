import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Settings2 } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeAlertPrefs } from '@/lib/preferences';
import SettingsForm from '@/components/user/SettingsForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login?callbackUrl=/settings');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { newsletterOptIn: true, alertPrefs: true },
  });
  if (!user) redirect('/login?callbackUrl=/settings');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-zinc-100">
        <Settings2 className="h-6 w-6 text-accent" /> Settings
      </h1>
      <p className="mt-2 text-sm text-muted">
        Control your newsletter subscription and Pakistan crypto regulation alerts.
      </p>

      <div className="mt-6">
        <SettingsForm
          initial={{
            newsletterOptIn: user.newsletterOptIn,
            alertPrefs: normalizeAlertPrefs(user.alertPrefs),
          }}
        />
      </div>
    </div>
  );
}
