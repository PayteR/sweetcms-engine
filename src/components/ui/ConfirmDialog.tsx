'use client';

import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border border-(--border-primary) bg-(--surface-primary) p-0 shadow-xl backdrop:bg-black/30"
    >
      <div className="ui-confirm-dialog-body p-6">
        <h3 className="text-lg font-semibold text-(--text-primary)">{title}</h3>
        <p className="mt-2 text-sm text-(--text-secondary)">{message}</p>
        <div className="ui-confirm-dialog-actions mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="admin-btn admin-btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              variant === 'danger'
                ? 'admin-btn admin-btn-danger'
                : 'admin-btn admin-btn-primary'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
