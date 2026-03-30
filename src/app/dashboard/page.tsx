'use client';

import Link from 'next/link';
import { FileText, Layers, FolderOpen, Users, Image, Clock } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { useBlankTranslations } from '@/lib/translations';
import { PostType } from '@/types/cms';
import GA4Widget from '@/components/admin/GA4Widget';

function StatCard({
  label,
  count,
  href,
  icon: Icon,
  color = 'blue',
}: {
  label: string;
  count: number | undefined;
  href: string;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const bgMap = {
    blue: 'bg-blue-50 dark:bg-blue-500/15',
    green: 'bg-green-50 dark:bg-green-500/15',
    purple: 'bg-purple-50 dark:bg-purple-500/15',
    orange: 'bg-orange-50 dark:bg-orange-500/15',
  };
  const textMap = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <Link href={href} className="admin-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${bgMap[color]}`}>
          <Icon className={`h-5 w-5 ${textMap[color]}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-(--text-muted)">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold text-(--text-primary)">
            {count ?? '—'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const __ = useBlankTranslations();
  const pageCounts = trpc.cms.counts.useQuery({ type: PostType.PAGE });
  const blogCounts = trpc.cms.counts.useQuery({ type: PostType.BLOG });
  const catCounts = trpc.categories.counts.useQuery();
  const userCounts = trpc.users.counts.useQuery();
  const mediaCounts = trpc.media.count.useQuery();

  return (
    <div>
      <h1 className="text-2xl font-bold text-(--text-primary)">{__('Dashboard')}</h1>
      <p className="mt-2 text-(--text-secondary)">{__('Welcome to SweetCMS admin panel.')}</p>

      {/* Content stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label={__('Pages')}
          count={pageCounts.data?.all}
          href="/dashboard/cms/pages"
          icon={FileText}
          color="blue"
        />
        <StatCard
          label={__('Blog Posts')}
          count={blogCounts.data?.all}
          href="/dashboard/cms/blog"
          icon={Layers}
          color="green"
        />
        <StatCard
          label={__('Categories')}
          count={catCounts.data?.all}
          href="/dashboard/cms/categories"
          icon={FolderOpen}
          color="orange"
        />
        <StatCard
          label={__('Users')}
          count={userCounts.data?.all}
          href="/dashboard/users"
          icon={Users}
          color="purple"
        />
        <StatCard
          label={__('Media Files')}
          count={mediaCounts.data?.count}
          href="/dashboard/media"
          icon={Image}
          color="blue"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="admin-card p-6">
          <h2 className="admin-h2">{__('Content Status')}</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: __('Published pages'), count: pageCounts.data?.published },
              { label: __('Draft pages'), count: pageCounts.data?.draft },
              { label: __('Published posts'), count: blogCounts.data?.published },
              { label: __('Draft posts'), count: blogCounts.data?.draft },
              { label: __('Scheduled'), count: (pageCounts.data?.scheduled ?? 0) + (blogCounts.data?.scheduled ?? 0) },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-(--text-secondary)">{row.label}</span>
                <span className="font-medium text-(--text-primary)">
                  {row.count ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-6">
          <h2 className="admin-h2">{__('Quick Actions')}</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/dashboard/cms/pages/new"
              className="admin-btn admin-btn-secondary justify-center"
            >
              <FileText className="h-4 w-4" />
              {__('New Page')}
            </Link>
            <Link
              href="/dashboard/cms/blog/new"
              className="admin-btn admin-btn-secondary justify-center"
            >
              <Layers className="h-4 w-4" />
              {__('New Blog Post')}
            </Link>
            <Link
              href="/dashboard/cms/categories/new"
              className="admin-btn admin-btn-secondary justify-center"
            >
              <FolderOpen className="h-4 w-4" />
              {__('New Category')}
            </Link>
          </div>
        </div>
      </div>

      {/* Google Analytics */}
      <div className="mt-6">
        <GA4Widget />
      </div>

      {/* Recent activity placeholder */}
      <div className="mt-6 admin-card p-6">
        <h2 className="admin-h2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-(--text-muted)" />
          {__('Recent Activity')}
        </h2>
        <p className="mt-3 text-sm text-(--text-muted)">
          {__('Activity log coming soon. For now, check the revision history on individual content items.')}
        </p>
      </div>
    </div>
  );
}
