'use client';

import { useCallback, useState } from 'react';

const STORAGE_PREFIX = 'cms-col-vis:';

const DEFAULT_VISIBLE = new Set(['title', 'status', 'lang', 'date']);

export function useColumnVisibility(storageKey: string) {
  const fullKey = `${STORAGE_PREFIX}${storageKey}`;

  const [visible, setVisible] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return DEFAULT_VISIBLE;
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) return new Set(JSON.parse(stored));
    } catch {}
    return new Set(DEFAULT_VISIBLE);
  });

  const toggle = useCallback(
    (col: string) => {
      setVisible((prev) => {
        const next = new Set(prev);
        if (next.has(col)) next.delete(col);
        else next.add(col);
        localStorage.setItem(fullKey, JSON.stringify([...next]));
        return next;
      });
    },
    [fullKey]
  );

  const isVisible = useCallback((col: string) => visible.has(col), [visible]);

  return { visible, toggle, isVisible };
}
