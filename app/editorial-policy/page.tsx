import type { Metadata } from 'next';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description:
    'Editorial Policy of Web3 Pakistan — source selection, corrections, news vs opinion, sponsored labeling, and AI content rules.',
};

export default function EditorialPolicyPage() {
  return (
    <ProsePage
      title="Editorial Policy"
      subtitle="How we decide what to publish — and how we label it."
      updated="October 2026"
    >
      <h2>Our commitment</h2>
      <p>
        Web3 Pakistan exists to give readers reliable intelligence on blockchain, crypto, and
        digital-asset regulation. Accuracy comes before speed: we would rather be second and
        right than first and wrong.
      </p>

      <h2>Source selection</h2>
      <ul>
        <li>
          We prioritize <strong className="text-zinc-100">primary sources</strong>: official
          announcements, published regulations, consultation papers, company statements, on-chain
          data, and direct interviews.
        </li>
        <li>
          Secondary reporting is used with attribution, and we verify claims against at least
          one additional source before publishing.
        </li>
        <li>
          Anonymous sources are used only when the information is in the public interest, cannot
          be obtained on the record, and has been corroborated. We explain to readers why
          anonymity was granted.
        </li>
        <li>We do not publish rumors from unverified social-media accounts as fact.</li>
      </ul>

      <h2>Regulatory verification</h2>
      <p>
        Coverage of regulation and policy is verified against the original official publication
        wherever one exists. Summaries link to the source document. We never invent government
        announcements, quotes, or policy positions — if an official position has not been
        published, we say so explicitly.
      </p>

      <h2>News vs. opinion</h2>
      <p>
        Every article carries a source label so readers always know what they are reading:
      </p>
      <ul>
        <li>
          <strong className="text-zinc-100">Official Source</strong> — republishes or directly
          summarizes an official document or announcement.
        </li>
        <li>
          <strong className="text-zinc-100">News Report</strong> — factual reporting by our team.
        </li>
        <li>
          <strong className="text-zinc-100">Analysis</strong> — interpretation of facts and data;
          conclusions are the author&apos;s.
        </li>
        <li>
          <strong className="text-zinc-100">Opinion</strong> — a stated viewpoint, not neutral
          reporting.
        </li>
        <li>
          <strong className="text-zinc-100">Educational</strong> — explainers and guides.
        </li>
      </ul>
      <p>
        Opinion and analysis never masquerade as news. Headlines accurately reflect the article
        body — no clickbait that the story cannot support.
      </p>

      <h2>Sponsored content labeling</h2>
      <ul>
        <li>All paid or sponsored content is clearly labeled “Sponsored” at the top of the page.</li>
        <li>Sponsors do not review, approve, or influence editorial content.</li>
        <li>Our journalists do not write sponsored content about subjects they cover editorially.</li>
      </ul>

      <h2>AI-assisted content</h2>
      <ul>
        <li>
          We may use AI tools for research assistance, transcription, or drafting — but every
          published article is reviewed, fact-checked, and approved by a human editor.
        </li>
        <li>AI is never used to fabricate quotes, sources, or data.</li>
        <li>
          Substantially AI-generated articles are labeled so readers know a machine assisted in
          production.
        </li>
      </ul>

      <h2>Corrections</h2>
      <p>
        When we make a mistake, we correct it promptly and transparently under our{' '}
        <a href="/corrections-policy">Corrections Policy</a>. Readers can report errors via the{' '}
        <a href="/contact">Contact page</a>.
      </p>

      <h2>Conflicts of interest</h2>
      <p>
        Our writers disclose relevant holdings when covering specific digital assets. We do not
        accept payment for favorable coverage.
      </p>
    </ProsePage>
  );
}
