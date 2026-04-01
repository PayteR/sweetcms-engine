'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBlankTranslations } from '@/lib/translations';

const widthClasses = {
  sm: 'max-w-[384px]',
  md: 'max-w-[512px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[768px]',
} as const;

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: keyof typeof widthClasses;
  children: React.ReactNode;
}

export function SlideOver({
  open,
  onClose,
  title,
  width = 'md',
  children,
}: SlideOverProps) {
  const __ = useBlankTranslations();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Focus trap + Escape
    const panel = panelRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && panel) {
        const focusable = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);

    // Lock scroll, compensate for scrollbar width to prevent content shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    // Auto-focus the close button
    const closeBtn = panel?.querySelector<HTMLElement>('button');
    closeBtn?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={cn('admin-slide-over', open && 'admin-slide-over-open')}
      role="dialog"
      aria-modal={open ? 'true' : undefined}
      inert={!open ? true : undefined}
    >
      <div
        className="admin-slide-over-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div ref={panelRef} className={cn('admin-slide-over-panel', widthClasses[width])}>
        {/* Header */}
        <div className="admin-slide-over-header flex items-center justify-between border-b border-(--border-secondary) px-5 py-4">
          <h2 className="admin-h2">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-(--text-muted) hover:bg-(--surface-inset) hover:text-(--text-primary)"
            title={__('Close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="admin-slide-over-body flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
