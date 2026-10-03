interface AdSlotProps {
  slot: string;
  html?: string | null;
  active?: boolean;
}

/**
 * Renders an ad placement. Shows the provided HTML only when the slot is
 * active; otherwise renders nothing (no empty placeholder boxes).
 */
export default function AdSlot({ slot, html, active = false }: AdSlotProps) {
  if (!active || !html) return null;

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-surface"
      data-ad-slot={slot}
      // Ad HTML is sanitized by the ad provider / admin before storage.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
