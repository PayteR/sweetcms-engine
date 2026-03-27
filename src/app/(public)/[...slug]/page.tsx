import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { CONTENT_TYPES } from '@/config/cms';
import { siteConfig } from '@/config/site';
import { serverTRPC } from '@/lib/trpc/server';
import { PostType, ContentStatus } from '@/types/cms';

interface Props {
  params: Promise<{ slug: string[] }>;
}

/**
 * Catch-all CMS route — resolves slugs to content types.
 *
 * URL patterns:
 *   /privacy-policy      → page with slug "privacy-policy"
 *   /blog/my-post        → blog post with slug "my-post"
 *   /category/tech       → category with slug "tech"
 */

function resolveSlug(segments: string[]): {
  contentType: (typeof CONTENT_TYPES)[number];
  slug: string;
} | null {
  if (segments.length === 0) return null;

  // Check if first segment matches a content type's listSegment
  for (const ct of CONTENT_TYPES) {
    if (ct.urlPrefix !== '/' && segments[0] === ct.listSegment) {
      if (segments.length === 2) {
        return { contentType: ct, slug: segments[1]! };
      }
      return null; // list page or invalid depth
    }
  }

  // Root-level: try page content type
  const pageCt = CONTENT_TYPES.find((ct) => ct.id === 'page');
  if (pageCt && segments.length === 1) {
    return { contentType: pageCt, slug: segments[0]! };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveSlug(slug);
  if (!resolved) return {};

  try {
    const api = await serverTRPC();
    if (resolved.contentType.postType != null) {
      const post = await api.cms.getBySlug({
        slug: resolved.slug,
        type: resolved.contentType.postType,
        lang: 'en',
      });
      return {
        title: post.seoTitle ?? `${post.title} | ${siteConfig.name}`,
        description: post.metaDescription ?? undefined,
        robots: post.noindex ? { index: false, follow: false } : undefined,
      };
    }
  } catch {
    return {};
  }

  return {};
}

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveSlug(slug);

  if (!resolved) {
    notFound();
  }

  try {
    const api = await serverTRPC();

    // Post-backed content type
    if (resolved.contentType.postType != null) {
      const post = await api.cms.getBySlug({
        slug: resolved.slug,
        type: resolved.contentType.postType,
        lang: 'en',
      });

      return (
        <article className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          {post.publishedAt && (
            <time className="mt-2 block text-sm text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          <div
            className="prose mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      );
    }

    // Category — handled by categories router
    // (extend here when category detail is needed)

    notFound();
  } catch {
    notFound();
  }
}
