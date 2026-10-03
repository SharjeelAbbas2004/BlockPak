import type { Metadata } from 'next';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Web3 Pakistan — what data we collect and how we use it.',
};

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy Policy" updated="October 2026">
      <p>
        Web3 Pakistan (“we”, “us”) respects your privacy. This policy explains what information
        we collect when you use our website, and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong className="text-zinc-100">Account information:</strong> if you register, we store
          your name, email address, and a securely hashed password. We never store passwords in
          plain text.
        </li>
        <li>
          <strong className="text-zinc-100">Newsletter:</strong> if you subscribe, we store your
          email address (and name, if provided) to send you our newsletter.
        </li>
        <li>
          <strong className="text-zinc-100">Usage data:</strong> we may collect anonymized
          analytics such as pages visited and device type to improve the site.
        </li>
        <li>
          <strong className="text-zinc-100">Cookies:</strong> we use cookies for essential
          functions (such as keeping you signed in and remembering preferences). See our{' '}
          <a href="/cookies">Cookie Policy</a>.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To operate your account and provide the services you request.</li>
        <li>To send newsletters you subscribed to (you can unsubscribe at any time).</li>
        <li>To improve our content and website experience.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <p>
        We do not sell your personal information. We do not share it with advertisers or data
        brokers. We share data with service providers (such as hosting or email delivery) only
        as needed to operate the site, and only under confidentiality obligations.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep account and subscription data for as long as your account or subscription is
        active, and delete or anonymize it within a reasonable period after you close your
        account or unsubscribe, unless the law requires longer retention.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data at any time
        via the <a href="/contact">Contact page</a>. Newsletter subscribers can unsubscribe via
        the link in any email.
      </p>

      <h2>Children</h2>
      <p>
        Our content is intended for a general audience and our accounts/newsletter are not
        directed at children under 13. We do not knowingly collect data from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be noted with a new
        “last updated” date above.
      </p>
    </ProsePage>
  );
}
