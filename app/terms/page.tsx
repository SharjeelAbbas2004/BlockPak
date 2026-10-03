import type { Metadata } from 'next';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for Web3 Pakistan.',
};

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Use" updated="October 2026">
      <p>
        By accessing Web3 Pakistan (the “Site”), you agree to these Terms of Use. If you do not
        agree, please do not use the Site.
      </p>

      <h2>Content is informational</h2>
      <p>
        All content is provided for general informational and educational purposes only. Nothing
        on the Site is financial, investment, legal, or tax advice — see our{' '}
        <a href="/disclaimer">Disclaimer</a>.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must provide accurate information when registering.</li>
        <li>You are responsible for keeping your credentials confidential.</li>
        <li>You must be at least 13 years old to create an account.</li>
        <li>We may suspend accounts that abuse the service or violate these terms.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Scrape the Site aggressively or attempt to disrupt its operation.</li>
        <li>Post unlawful, harassing, or spam content in comments or forms.</li>
        <li>Impersonate Web3 Pakistan staff or other users.</li>
        <li>Use the Site to facilitate fraud or other illegal activity.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Articles, graphics, and other original content on the Site are owned by Web3 Pakistan or
        our licensors. You may share links and brief excerpts with attribution, but you may not
        republish full articles without permission.
      </p>

      <h2>User content</h2>
      <p>
        Comments and messages you submit remain yours, but you grant us a license to display and
        moderate them on the Site. We may remove content that violates these terms.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The Site is provided “as is” without warranties of any kind. To the maximum extent
        permitted by law, Web3 Pakistan is not liable for any loss arising from your use of the
        Site or reliance on its content — including investment decisions.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms at any time; continued use of the Site after changes take
        effect constitutes acceptance.
      </p>
    </ProsePage>
  );
}
