import { prisma } from '@/lib/prisma';

/** Subscribe (or re-confirm) an email address to the newsletter. */
export async function subscribeEmail(email: string, name?: string) {
  const normalized = email.toLowerCase().trim();
  return prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    update: name ? { name } : {},
    create: { email: normalized, name },
  });
}

/** Total number of newsletter subscribers. */
export async function getSubscriberCount(): Promise<number> {
  return prisma.newsletterSubscriber.count();
}
