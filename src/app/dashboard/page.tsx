'use client';

import Link from 'next/link';
import { FileText, Layers, FolderOpen } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { PostType } from '@/types/cms';

function StatCard({
  label,
  count,
  href,
  icon: Icon,
}: {
  label: string;
  count: number | undefined;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link href={href} className="admin-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold text-gray-900">
            {count ?? '—'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const pageCounts = trpc.cms.counts.useQuery({ type: PostType.PAGE });
  const blogCounts = trpc.cms.counts.useQuery({ type: PostType.BLOG });
  const catCounts = trpc.categories.counts.useQuery();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to SweetCMS admin panel.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pages"
          count={pageCounts.data?.all}
          href="/dashboard/cms/pages"
          icon={FileText}
        />
        <StatCard
          label="Blog Posts"
          count={blogCounts.data?.all}
          href="/dashboard/cms/blog"
          icon={Layers}
        />
        <StatCard
          label="Categories"
          count={catCounts.data?.all}
          href="/dashboard/cms/categories"
          icon={FolderOpen}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="admin-card p-6">
          <h2 className="admin-h2">Content Status</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Published pages', count: pageCounts.data?.published },
              { label: 'Draft pages', count: pageCounts.data?.draft },
              { label: 'Published posts', count: blogCounts.data?.published },
              { label: 'Draft posts', count: blogCounts.data?.draft },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600">{row.label}</span>
                <span className="font-medium text-gray-900">
                  {row.count ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-6">
          <h2 className="admin-h2">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/dashboard/cms/pages/new"
              className="admin-btn admin-btn-secondary justify-center"
            >
              New Page
            </Link>
            <Link
              href="/dashboard/cms/blog/new"
              className="admin-btn admin-btn-secondary justify-center"
            >
              New Blog Post
            </Link>
            <Link
              href="/dashboard/cms/categories/new"
              className="admin-btn admin-btn-secondary justify-center"
            >
              New Category
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
