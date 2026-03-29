'use client';

import { Loader2, Trash2, Undo2 } from 'lucide-react';

import { useBlankTranslations } from '@/lib/translations';
import { ContentStatus } from '@/types/cms';

interface BulkActionBarProps {
  selectedCount: number;
  trashed: boolean;
  onBulkTrash: () => void;
  onBulkRestore: () => void;
  onBulkStatusChange: (status: number) => void;
  onDeselectAll: () => void;
  isPending: boolean;
}

export default function BulkActionBar({
  selectedCount,
  trashed,
  onBulkTrash,
  onBulkRestore,
  onBulkStatusChange,
  onDeselectAll,
  isPending,
}: BulkActionBarProps) {
  const __ = useBlankTranslations();

  if (selectedCount === 0) return null;

  return (
    <div className="mt-3 flex items-center justify-between rounded-lg border border-(--border-primary) bg-(--surface-secondary) px-4 py-3">
      <div className="flex items-center gap-3">
        {isPending && (
          <Loader2 size={16} className="animate-spin text-(--text-muted)" />
        )}
        <span className="text-sm font-medium text-(--text-primary)">
          {selectedCount}{' '}
          {__(selectedCount === 1 ? 'item selected' : 'items selected')}
        </span>
        <button
          type="button"
          onClick={onDeselectAll}
          className="text-sm text-(--text-muted) underline hover:text-(--text-primary)"
        >
          {__('Deselect all')}
        </button>
      </div>
      <div className="flex items-center gap-2">
        {trashed ? (
          <button
            type="button"
            onClick={onBulkRestore}
            disabled={isPending}
            className="admin-btn admin-btn-secondary gap-1 text-sm disabled:opacity-50"
          >
            <Undo2 size={14} />
            {__('Restore')}
          </button>
        ) : (
          <>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val !== '') onBulkStatusChange(Number(val));
                e.target.value = '';
              }}
              defaultValue=""
              disabled={isPending}
              className="rounded-md border border-(--border-primary) px-2 py-1.5 text-sm disabled:opacity-50"
            >
              <option value="" disabled>
                {__('Set status...')}
              </option>
              <option value={ContentStatus.DRAFT}>{__('Draft')}</option>
              <option value={ContentStatus.PUBLISHED}>{__('Published')}</option>
            </select>
            <button
              type="button"
              onClick={onBulkTrash}
              disabled={isPending}
              className="admin-btn gap-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {__('Move to Trash')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
