'use client';

import { BarChart3, Hash, Link2, AlertTriangle } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { useBlankTranslations } from '@/lib/translations';

export function TaxonomyOverview() {
  const __ = useBlankTranslations();
  const { data, isLoading } = trpc.tags.stats.useQuery();

  if (isLoading || !data) return null;

  const statCards = [
    {
      label: __('Total Tags'),
      value: data.totalTags,
      icon: Hash,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: __('Published'),
      value: data.publishedTags,
      icon: BarChart3,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: __('Relationships'),
      value: data.totalRelationships,
      icon: Link2,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: __('Orphaned'),
      value: data.orphanedTags,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="admin-card p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top tags table */}
      {data.topTags.length > 0 && (
        <div className="admin-card overflow-hidden">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {__('Top Tags')}
            </h3>
          </div>
          <table className="w-full">
            <thead className="admin-thead">
              <tr>
                <th className="admin-th">{__('Tag')}</th>
                <th className="admin-th w-24 text-right">{__('Posts')}</th>
              </tr>
            </thead>
            <tbody>
              {data.topTags.map((tag) => (
                <tr key={tag.slug} className="hover:bg-gray-50">
                  <td className="admin-td text-sm font-medium text-gray-900">
                    {tag.name}
                  </td>
                  <td className="admin-td text-right text-sm text-gray-500">
                    {Number(tag.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
