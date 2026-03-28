import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { siteConfig } from '@/config/site';
import { serverTRPC } from '@/lib/trpc/server';
import { PostType } from '@/types/cms';
import { PostCard } from '@/components/public/PostCard';
import { TagCloud } from '@/components/public/TagCloud';

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
};

export default async function HomePage() {
  let recentPosts: Array<{
    id: string;
    slug: string;
    title: string;
    metaDescription: string | null;
    publishedAt: Date | null;
    tags: { id: string; name: string; slug: string }[];
  }> = [];

  try {
    const api = await serverTRPC();
    const data = await api.cms.listPublished({
      type: PostType.BLOG,
      lang: 'en',
      page: 1,
      pageSize: 3,
    });
    recentPosts = data.results;
  } catch {
    // DB may not be initialized yet
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-(--surface-primary)">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-(--text-primary) sm:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-(--text-secondary)">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Read the Blog
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-(--border-primary) bg-(--surface-primary) px-6 py-3 text-sm font-medium text-(--text-secondary) shadow-sm hover:bg-(--surface-secondary)"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section className="border-t border-(--border-secondary) bg-(--surface-secondary)">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-(--text-primary)">Recent Posts</h2>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {recentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  title={post.title}
                  href={`/blog/${post.slug}`}
                  metaDescription={post.metaDescription}
                  publishedAt={post.publishedAt}
                  tags={post.tags}
                  variant="card"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tag cloud */}
      <TagCloud limit={15} sectionTitle="Popular Tags" sectionClassName="border-t border-(--border-secondary) bg-(--surface-primary)" containerClassName="mx-auto max-w-5xl px-4 py-12" />

      {/* Features */}
      <section className="border-t border-(--border-secondary)">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-(--text-primary)">
            Built for the future
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold text-(--text-primary)">Agent-Driven</h3>
              <p className="mt-1 text-sm text-(--text-secondary)">
                Designed for AI-assisted development with comprehensive CLAUDE.md documentation.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold text-(--text-primary)">T3 Stack</h3>
              <p className="mt-1 text-sm text-(--text-secondary)">
                Next.js 16, tRPC, Drizzle ORM, Better Auth. Type-safe from database to UI.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold text-(--text-primary)">Secure by Default</h3>
              <p className="mt-1 text-sm text-(--text-secondary)">
                Role-based access control, scrypt passwords, session management, and soft-delete.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
