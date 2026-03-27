import Link from 'next/link';
import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';
import { serverTRPC } from '@/lib/trpc/server';
import { PostType } from '@/types/cms';

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: 'Latest blog posts',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogListPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  let data;
  try {
    const api = await serverTRPC();
    data = await api.cms.listPublished({
      type: PostType.BLOG,
      lang: 'en',
      page,
      pageSize: 10,
    });
  } catch {
    data = null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Blog</h1>

      {data && data.results.length > 0 ? (
        <div className="mt-8 space-y-8">
          {data.results.map((post) => (
            <article key={post.id} className="border-b border-gray-100 pb-6">
              <Link
                href={`/blog/${post.slug}`}
                className="text-xl font-semibold text-gray-900 hover:text-blue-600"
              >
                {post.title}
              </Link>
              {post.metaDescription && (
                <p className="mt-2 text-gray-600">{post.metaDescription}</p>
              )}
              {post.publishedAt && (
                <time className="mt-1 block text-sm text-gray-400">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
            </article>
          ))}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="rounded bg-gray-100 px-3 py-1 text-sm"
                >
                  Previous
                </Link>
              )}
              <span className="px-3 py-1 text-sm text-gray-500">
                Page {page} of {data.totalPages}
              </span>
              {page < data.totalPages && (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="rounded bg-gray-100 px-3 py-1 text-sm"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-8 text-gray-500">No blog posts yet.</p>
      )}
    </div>
  );
}
