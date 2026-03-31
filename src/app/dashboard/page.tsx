'use client';

import Link from 'next/link';
import {
  FileText, Layers, FolderOpen, Users, Image, Clock,
  Briefcase, ExternalLink,
} from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { useBlankTranslations } from '@/lib/translations';
import { PostType } from '@/engine/types/cms';
import GA4Widget from '@/components/admin/GA4Widget';
import StatCard from '@/components/admin/StatCard';
import RecentActivity from '@/components/admin/RecentActivity';

export default function DashboardPage() {
  const __ = useBlankTranslations();
  const pageCounts = trpc.cms.counts.useQuery({ type: PostType.PAGE });
  const blogCounts = trpc.cms.counts.useQuery({ type: PostType.BLOG });
  const catCounts = trpc.categories.counts.useQuery();
  const userCounts = trpc.users.counts.useQuery();
  const mediaCounts = trpc.media.count.useQuery();

  return (
    <div className="mx-auto max-w-320">
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
        <div className="admin-card flex flex-col overflow-hidden">
          <div className="admin-widget-header">
            <h2 className="admin-h2">{__('Content Status')}</h2>
          </div>
          <div className="admin-stat-grid px-4">
            {[
              { label: __('Published pages'), count: pageCounts.data?.published },
              { label: __('Draft pages'), count: pageCounts.data?.draft },
              { label: __('Published posts'), count: blogCounts.data?.published },
              { label: __('Draft posts'), count: blogCounts.data?.draft },
              { label: __('Scheduled'), count: (pageCounts.data?.scheduled ?? 0) + (blogCounts.data?.scheduled ?? 0) },
            ].map((row) => (
              <div key={row.label} className="admin-stat-row">
                <span className="admin-stat-label">{row.label}</span>
                <span className="admin-stat-value">{row.count ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card flex flex-col overflow-hidden">
          <div className="admin-widget-header">
            <h2 className="admin-h2">{__('Quick Actions')}</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            <Link href="/dashboard/cms/pages/new" className="admin-btn admin-btn-secondary justify-center">
              <FileText className="h-4 w-4" />
              {__('New Page')}
            </Link>
            <Link href="/dashboard/cms/blog/new" className="admin-btn admin-btn-secondary justify-center">
              <Layers className="h-4 w-4" />
              {__('New Post')}
            </Link>
            <Link href="/dashboard/cms/categories/new" className="admin-btn admin-btn-secondary justify-center">
              <FolderOpen className="h-4 w-4" />
              {__('New Category')}
            </Link>
            <Link href="/dashboard/cms/portfolio/new" className="admin-btn admin-btn-secondary justify-center">
              <Briefcase className="h-4 w-4" />
              {__('New Project')}
            </Link>
            <Link href="/dashboard/media" className="admin-btn admin-btn-secondary justify-center">
              <Image className="h-4 w-4" />
              {__('Media Library')}
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary justify-center">
              <ExternalLink className="h-4 w-4" />
              {__('View Site')}
            </a>
          </div>
        </div>
      </div>

      {/* Google Analytics */}
      <div className="mt-6">
        <GA4Widget />
      </div>

      {/* Recent activity */}
      <div className="mt-6 admin-card flex flex-col overflow-hidden">
        <div className="admin-widget-header">
          <h2 className="admin-h2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-(--text-muted)" />
            {__('Recent Activity')}
          </h2>
          <Link
            href="/dashboard/cms/activity"
            className="text-xs font-medium text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
            {__('View all')}
          </Link>
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
