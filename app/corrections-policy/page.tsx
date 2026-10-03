import type { Metadata } from 'next';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Corrections Policy',
  description: 'Corrections Policy of Web3 Pakistan — how we fix mistakes transparently.',
};

export default function CorrectionsPolicyPage() {
  return (
    <ProsePage
      title="Corrections Policy"
      subtitle="We correct mistakes quickly, openly, and without hiding them."
      updated="October 2026"
    >
      <h2>Our promise</h2>
      <p>
        Errors happen even in careful newsrooms. What matters is how they are handled. When Web3
        Pakistan publishes something inaccurate, we fix it as soon as we verify the correct
        information — and we tell readers what changed.
      </p>

      <h2>How corrections work</h2>
      <ul>
        <li>
          <strong className="text-zinc-100">Minor errors</strong> (typos, formatting, broken
          links): fixed silently.
        </li>
        <li>
          <strong className="text-zinc-100">Factual errors</strong>: corrected in the article body
          with a dated correction note at the bottom explaining what was wrong and what it now
          says.
        </li>
        <li>
          <strong className="text-zinc-100">Serious errors</strong> (wrong conclusions, misattributed
          quotes, incorrect regulatory claims): corrected with a prominent editor&apos;s note at
          the top of the article, in addition to the dated note.
        </li>
        <li>
          Articles that are fundamentally wrong are retracted, with the original URL showing a
          clear retraction notice rather than disappearing.
        </li>
      </ul>

      <h2>Report an error</h2>
      <p>
        Spotted a mistake? Please tell us via the <a href="/contact">Contact page</a> with the
        subject “Correction”, including the article URL and what you believe is wrong. Reports
        with a link to a primary source are resolved fastest.
      </p>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We never quietly rewrite history — substantive changes are always noted.</li>
        <li>We never delete critical reader comments pointing out genuine errors.</li>
        <li>
          We distinguish corrections (we got a fact wrong) from updates (new developments since
          publication) — updates are labeled “Updated” with a timestamp.
        </li>
      </ul>
    </ProsePage>
  );
}
