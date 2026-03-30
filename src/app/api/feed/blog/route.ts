import { NextResponse } from 'next/server';

import { siteConfig } from '@/config/site';
import { db } from '@/server/db';
import { cmsPosts } from '@/server/db/schema';
import { ContentStatus, PostType } from '@/engine/types/cms';
import { and, desc, eq, isNull } from 'drizzle-orm';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    const posts = await db
      .select({
        id: cmsPosts.id,
        title: cmsPosts.title,
        slug: cmsPosts.slug,
        metaDescription: cmsPosts.metaDescription,
        publishedAt: cmsPosts.publishedAt,
      })
      .from(cmsPosts)
      .where(
        and(
          eq(cmsPosts.type, PostType.BLOG),
          eq(cmsPosts.lang, 'en'),
          eq(cmsPosts.status, ContentStatus.PUBLISHED),
          isNull(cmsPosts.deletedAt)
        )
      )
      .orderBy(desc(cmsPosts.publishedAt))
      .limit(20);

    const items = posts
      .map((post) => {
        const link = `${siteConfig.url}/blog/${post.slug}`;
        const pubDate = post.publishedAt
          ? new Date(post.publishedAt).toUTCString()
          : '';
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      ${post.metaDescription ? `<description>${escapeXml(post.metaDescription)}</description>` : ''}
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} — Blog</title>
    <link>${escapeXml(siteConfig.url)}/blog</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(siteConfig.url)}/api/feed/blog" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    });
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
