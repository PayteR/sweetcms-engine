'use client';

import { useState } from 'react';
import { History, RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { useBlankTranslations } from '@/lib/translations';
import { toast } from '@/store/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Props {
  contentType: string;
  contentId: string;
  onRestored?: () => void;
}

export function RevisionHistory({ contentType, contentId, onRestored }: Props) {
  const __ = useBlankTranslations();
  const utils = trpc.useUtils();
  const [expanded, setExpanded] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const revisions = trpc.revisions.list.useQuery(
    { contentType, contentId },
    { enabled: expanded }
  );

  const revisionDetail = trpc.revisions.get.useQuery(
    { id: previewId! },
    { enabled: !!previewId }
  );

  const restore = trpc.revisions.restore.useMutation({
    onSuccess: () => {
      toast.success(__('Revision restored'));
      onRestored?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleRestore() {
    if (!restoreTarget) return;
    restore.mutate({ id: restoreTarget });
    setRestoreTarget(null);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="admin-card p-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <h3 className="admin-h2 flex items-center gap-2">
          <History className="h-4 w-4" />
          {__('Revision History')}
        </h3>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-(--text-muted)" />
        ) : (
          <ChevronDown className="h-4 w-4 text-(--text-muted)" />
        )}
      </button>

      {expanded && (
        <div className="mt-4">
          {revisions.isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-(--text-muted)" />
            </div>
          ) : (revisions.data ?? []).length === 0 ? (
            <p className="text-sm text-(--text-muted)">{__('No revisions yet.')}</p>
          ) : (
            <div className="space-y-2">
              {(revisions.data ?? []).map((rev) => {
                const snapshot = rev.snapshot as Record<string, unknown>;
                const title =
                  (snapshot.title as string) ??
                  (snapshot.name as string) ??
                  __('(untitled)');
                const isPreview = previewId === rev.id;

                return (
                  <div key={rev.id}>
                    <div className="flex items-center justify-between rounded-md border border-(--border-primary) px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-(--text-secondary)">
                          {title}
                        </p>
                        <p className="text-xs text-(--text-muted)">
                          {formatDate(rev.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewId(isPreview ? null : rev.id)
                          }
                          className="rounded px-2 py-1 text-xs text-(--text-muted) hover:bg-(--surface-secondary) hover:text-(--text-primary)"
                        >
                          {isPreview ? __('Hide') : __('Preview')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRestoreTarget(rev.id)}
                          className="rounded p-1.5 text-(--text-muted) hover:bg-(--surface-secondary) hover:text-blue-600"
                          title={__('Restore this revision')}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Preview panel */}
                    {isPreview && revisionDetail.data && (
                      <div className="mt-1 rounded-md border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10 p-3">
                        <pre className="max-h-60 overflow-auto text-xs text-(--text-secondary)">
                          {JSON.stringify(
                            revisionDetail.data.snapshot,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!restoreTarget}
        title={__('Restore revision?')}
        message={__(
          'This will overwrite the current content with the selected revision. Continue?'
        )}
        confirmLabel={__('Restore')}
        variant="default"
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}
