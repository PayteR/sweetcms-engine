import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

import { CONTENT_TYPES } from '@/config/cms';
import { siteConfig } from '@/config/site';
import { serverTRPC } from '@/lib/trpc/server';
import { PostType, ContentStatus } from '@/types/cms';

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ preview?: string }>;
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
      return null;
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

      const metadata: Metadata = {
        title: post.seoTitle ?? `${post.title} | ${siteConfig.name}`,
        description: post.metaDescription ?? undefined,
        robots: post.noindex ? { index: false, follow: false } : undefined,
      };

      if (post.featuredImage) {
        metadata.openGraph = {
          images: [{ url: post.featuredImage, alt: post.featuredImageAlt ?? post.title }],
        };
      }

      return metadata;
    }

    // Category metadata
    if (resolved.contentType.id === 'category') {
      const cat = await api.categories.getBySlug({
        slug: resolved.slug,
        lang: 'en',
      });
      return {
        title: cat.seoTitle ?? `${cat.title} | ${siteConfig.name}`,
        description: cat.metaDescription ?? undefined,
        robots: cat.noindex ? { index: false, follow: false } : undefined,
      };
    }
  } catch {
    return {};
  }

  return {};
}

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
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
        previewToken: preview,
      });

      return (
        <article className="mx-auto max-w-3xl px-4 py-12">
          {preview && (
            <div className="mb-6 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm text-yellow-800">
              Preview mode — this content is not yet published.
            </div>
          )}

          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt ?? post.title}
              className="mb-8 w-full rounded-lg object-cover"
              style={{ maxHeight: '400px' }}
            />
          )}

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {post.title}
          </h1>

          {post.publishedAt && (
            <time className="mt-3 block text-sm text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}

          <div
            className="prose prose-gray mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* JSON-LD */}
          {post.jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: post.jsonLd }}
            />
          )}
        </article>
      );
    }

    // Category detail
    if (resolved.contentType.id === 'category') {
      const cat = await api.categories.getBySlug({
        slug: resolved.slug,
        lang: 'en',
      });

      return (
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {cat.title}
          </h1>

          {cat.text && (
            <div
              className="prose prose-gray mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: cat.text }}
            />
          )}
        </div>
      );
    }

    notFound();
  } catch {
    notFound();
  }
}
