import Link from 'next/link';

import { serverTRPC } from '@/lib/trpc/server';

interface Props {
  lang?: string;
  limit?: number;
  /** When provided, wraps the cloud in a <section> with this title */
  sectionTitle?: string;
  /** CSS class for the section wrapper */
  sectionClassName?: string;
}

export async function TagCloud({
  lang = 'en',
  limit = 20,
  sectionTitle,
  sectionClassName,
}: Props) {
  let tags: { id: string; name: string; slug: string; count: number }[] = [];

  try {
    const api = await serverTRPC();
    tags = await api.tags.listPopular({ lang, limit });
  } catch {
    return null;
  }

  if (tags.length === 0) return null;

  // Calculate size tiers based on count distribution
  const counts = tags.map((t) => Number(t.count));
  const sorted = [...counts].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 1;
  const top20Threshold = sorted[Math.floor(sorted.length * 0.8)] ?? median;

  function getSizeClass(count: number): string {
    if (count >= top20Threshold && top20Threshold > median) {
      return 'text-base font-semibold';
    }
    if (count >= median) {
      return 'text-sm font-medium';
    }
    return 'text-xs';
  }

  const cloud = (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tag/${tag.slug}`}
          className={`inline-block rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 ${getSizeClass(Number(tag.count))}`}
        >
          {tag.name}
          <span className="ml-1 text-gray-400">({Number(tag.count)})</span>
        </Link>
      ))}
    </div>
  );

  if (sectionTitle) {
    return (
      <section className={sectionClassName}>
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-xl font-bold text-gray-900">{sectionTitle}</h2>
          <div className="mt-4">{cloud}</div>
        </div>
      </section>
    );
  }

  return cloud;
}
