import Link from 'next/link';

export interface BreakingNewsItem {
  id: string;
  text: string;
  url?: string | null;
}

interface BreakingNewsProps {
  items: BreakingNewsItem[];
}

export default function BreakingNews({ items }: BreakingNewsProps) {
  if (!items || items.length === 0) return null;

  const loop = items.length > 1 ? [...items, ...items] : items;

  return (
    <div className="flex items-stretch bg-red-600/10" aria-label="Breaking news">
      <span className="flex shrink-0 items-center bg-red-600 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white sm:px-4">
        Breaking
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div
          className={items.length > 1 ? 'ticker-track flex w-max animate-marquee items-center gap-10 px-4 py-1.5' : 'px-4 py-1.5'}
        >
          {loop.map((item, i) => (
            <span key={`${item.id}-${i}`} className="whitespace-nowrap text-xs font-medium text-zinc-200">
              {item.url ? (
                <Link href={item.url} className="hover:text-accent hover:underline">
                  {item.text}
                </Link>
              ) : (
                item.text
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
