'use client';

import { memo } from 'react';

import { X } from 'lucide-react';

import { useBlankTranslations } from '@/lib/translations';

interface AutosaveRecoveryBannerProps {
  savedAt: number;
  onRestore: () => void;
  onDismiss: () => void;
}

function timeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return 'a few seconds ago';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return 'yesterday';
}

function AutosaveRecoveryBanner({
  savedAt,
  onRestore,
  onDismiss,
}: AutosaveRecoveryBannerProps) {
  const __ = useBlankTranslations();

  return (
    <div className="rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-blue-700 dark:text-blue-300">
          {__('Unsaved changes recovered from')} {timeAgo(savedAt)}.
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRestore}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
          >
            {__('Restore')}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-blue-400 transition-colors hover:text-blue-300"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(AutosaveRecoveryBanner);
