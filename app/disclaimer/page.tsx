import type { Metadata } from 'next';
import ProsePage from '@/components/layout/ProsePage';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Disclaimer for Web3 Pakistan — educational content, not financial advice.',
};

export default function DisclaimerPage() {
  return (
    <ProsePage title="Disclaimer" updated="October 2026">
      <h2>Not financial advice</h2>
      <p>
        Web3 Pakistan provides educational and informational content about blockchain,
        cryptocurrency and digital assets. Nothing on this website constitutes financial,
        investment, legal or tax advice. Cryptocurrency and digital assets involve significant
        risks. Users should conduct their own research and consult qualified professionals where
        appropriate.
      </p>

      <h2>Risk warning</h2>
      <p>
        Digital assets are volatile and can lose some or all of their value. Past performance is
        not an indicator of future results. Never invest money you cannot afford to lose, and be
        wary of scams, phishing attempts, and impersonators claiming to represent this
        publication.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We work to keep our reporting accurate and up to date, but the Web3 industry moves fast
        and information can change. Market data shown on this site may be delayed, approximate,
        or provided for illustration. We do not guarantee the completeness or timeliness of any
        content.
      </p>

      <h2>Regulatory content</h2>
      <p>
        Our regulation coverage reports on publicly available statements, consultations, and
        official publications. It is journalism, not legal interpretation. Regulatory positions
        described here may change, and summaries may not capture every detail of the underlying
        documents. Always consult the original source and qualified counsel for decisions with
        legal consequences.
      </p>

      <h2>Third-party links</h2>
      <p>
        Articles may link to external websites. We are not responsible for the content, accuracy,
        or practices of third-party sites.
      </p>
    </ProsePage>
  );
}
