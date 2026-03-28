import { SEO_OVERRIDE_ROUTES } from '@/config/cms';

export const SEO_OVERRIDE_SLUGS = new Set(SEO_OVERRIDE_ROUTES.map((r) => r.slug));

export function isSeoOverrideSlug(slug: string): boolean {
  return SEO_OVERRIDE_SLUGS.has(slug);
}
