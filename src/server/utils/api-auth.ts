import crypto from 'crypto';
import { eq } from 'drizzle-orm';

import { db } from '@/server/db';
import { cmsOptions } from '@/server/db/schema';

const rateMap = new Map<string, { count: number; resetAt: number }>();

/** Validate API key from x-api-key header. Returns true if valid or if no key is configured. */
export async function validateApiKey(request: Request): Promise<boolean> {
  const [option] = await db
    .select({ value: cmsOptions.value })
    .from(cmsOptions)
    .where(eq(cmsOptions.key, 'api.key'))
    .limit(1);

  if (!option?.value) return true; // No key configured = public access

  const providedKey = request.headers.get('x-api-key');
  if (!providedKey) return false;

  const hash = crypto.createHash('sha256').update(providedKey).digest('hex');
  return hash === (option.value as string);
}

/** Simple in-memory rate limiter: 100 req/min per IP */
export function checkRateLimit(request: Request): boolean {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  entry.count++;
  return entry.count <= 100;
}

/** Standard CORS and cache headers */
export function apiHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'x-api-key, content-type',
  };
}
