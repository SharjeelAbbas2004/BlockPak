import type { Metadata } from 'next';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for Web3 Pakistan.',
};

export default function CookiesPage() {
  return (
    <ProsePage title="Cookie Policy" updated="October 2026">
      <p>
        This Cookie Policy explains how Web3 Pakistan uses cookies and similar technologies.
      </p>

      <h2>What cookies are</h2>
      <p>
        Cookies are small text files stored on your device by your browser. They help websites
        remember your preferences and keep you signed in.
      </p>

      <h2>Cookies we use</h2>
      <ul>
        <li>
          <strong className="text-zinc-100">Essential cookies:</strong> required for the site to
          work — for example, authentication session cookies when you sign in, and the cookie
          that remembers your cookie-consent choice.
        </li>
        <li>
          <strong className="text-zinc-100">Preference cookies:</strong> remember settings such
          as your theme (dark/light mode).
        </li>
        <li>
          <strong className="text-zinc-100">Analytics cookies:</strong> if enabled, these help us
          understand aggregate usage (e.g., which articles are popular) so we can improve the
          site. They do not identify you personally.
        </li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can block or delete cookies through your browser settings. Note that blocking
        essential cookies may prevent sign-in and other features from working. Dismissing our
        cookie banner stores a single cookie recording your choice.
      </p>

      <h2>Third-party cookies</h2>
      <p>
        Embedded content (such as videos or social posts) may set their own cookies subject to
        those providers&apos; policies. We do not control third-party cookies.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies? Reach us via the <a href="/contact">Contact page</a>.
      </p>
    </ProsePage>
  );
}
