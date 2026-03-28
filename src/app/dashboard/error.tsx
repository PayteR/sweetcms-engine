'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-full max-w-md rounded-lg border border-(--border-primary) bg-(--surface-primary) p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-(--text-primary)">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-(--text-secondary)">
          {error.message || 'An unexpected error occurred in the admin panel.'}
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-(--text-muted)">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
