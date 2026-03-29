'use client';

import { useBlankTranslations } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description: string;
  slug: string;
  urlPrefix: string;
  featuredImage?: string;
}

function charColor(len: number, warn: number, max: number) {
  if (len <= warn) return 'text-green-600 dark:text-green-400';
  if (len <= max) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function SeoPreviewCard({ title, description, slug, urlPrefix, featuredImage }: Props) {
  const __ = useBlankTranslations();
  const displayTitle = (title || 'Page Title').slice(0, 70);
  const displayDesc = (description || 'No meta description set.').slice(0, 170);
  const displayUrl = `example.com${urlPrefix}${slug || 'page-slug'}`;

  return (
    <div className="admin-card p-6">
      <h3 className="admin-h2">{__('SEO Preview')}</h3>

      {/* Google snippet */}
      <div className="mt-4 rounded-md border border-(--border-primary) bg-(--surface-primary) p-4">
        <p className="text-xs text-(--text-muted) mb-1">{__('Google Search')}</p>
        <p className="text-sm text-blue-700 dark:text-blue-400 truncate">{displayTitle}</p>
        <p className="text-xs text-green-700 dark:text-green-400">{displayUrl}</p>
        <p className="mt-1 text-xs text-(--text-secondary) line-clamp-2">{displayDesc}</p>
      </div>

      {/* OG card preview */}
      <div className="mt-4 rounded-md border border-(--border-primary) overflow-hidden">
        <p className="px-4 pt-2 text-xs text-(--text-muted)">{__('Social Card')}</p>
        <div className="flex gap-3 p-4">
          <div className="h-16 w-16 shrink-0 rounded bg-(--surface-secondary) flex items-center justify-center text-xs text-(--text-muted) overflow-hidden">
            {featuredImage ? (
              <img src={featuredImage} alt="" className="h-full w-full object-cover" />
            ) : (
              __('No img')
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-(--text-primary) truncate">{displayTitle}</p>
            <p className="text-xs text-(--text-secondary) line-clamp-2">{displayDesc}</p>
          </div>
        </div>
      </div>

      {/* Character counters */}
      <div className="mt-3 flex gap-4 text-xs">
        <span className={cn(charColor(title.length, 50, 60))}>
          {__('Title')}: {title.length}/60
        </span>
        <span className={cn(charColor(description.length, 140, 160))}>
          {__('Description')}: {description.length}/160
        </span>
      </div>
    </div>
  );
}
