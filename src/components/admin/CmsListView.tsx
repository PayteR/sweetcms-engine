'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

import type { ContentTypeDeclaration } from '@/config/cms';
import { useBlankTranslations } from '@/lib/translations';

interface Props {
  contentType: ContentTypeDeclaration;
}

export function CmsListView({ contentType }: Props) {
  const __ = useBlankTranslations();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {__(contentType.labelPlural)}
        </h1>
        <Link
          href={`/dashboard/cms/${contentType.adminSlug}/new`}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="h-4 w-4" />
          {__(`New ${contentType.label}`)}
        </Link>
      </div>

      {/* Status tabs */}
      <div className="mt-4 flex gap-2 border-b border-gray-200">
        {['All', 'Draft', 'Published', 'Scheduled', 'Trash'].map((tab) => (
          <button
            key={tab}
            className="border-b-2 border-transparent px-3 pb-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            {__(tab)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card mt-4 overflow-hidden">
        <table className="w-full">
          <thead className="admin-thead">
            <tr>
              <th className="admin-th">{__('Title')}</th>
              <th className="admin-th">{__('Status')}</th>
              <th className="admin-th">{__('Language')}</th>
              <th className="admin-th">{__('Date')}</th>
              <th className="admin-th" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="admin-td text-center text-gray-400" colSpan={5}>
                {__('No items yet. Create your first one.')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
