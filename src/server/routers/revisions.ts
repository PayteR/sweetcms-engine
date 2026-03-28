import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

import { cmsPosts, cmsCategories, cmsContentRevisions } from '@/server/db/schema';
import { getRevisions } from '@/server/utils/content-revisions';
import { createTRPCRouter, sectionProcedure } from '../trpc';

const contentProcedure = sectionProcedure('content');

export const revisionsRouter = createTRPCRouter({
  /** List revisions for a content item */
  list: contentProcedure
    .input(
      z.object({
        contentType: z.string().max(30),
        contentId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return getRevisions(ctx.db, input.contentType, input.contentId, input.limit);
    }),

  /** Get a single revision */
  get: contentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [revision] = await ctx.db
        .select()
        .from(cmsContentRevisions)
        .where(eq(cmsContentRevisions.id, input.id))
        .limit(1);

      if (!revision) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Revision not found' });
      }

      return revision;
    }),

  /** Restore a revision — overwrites the content item with the snapshot data */
  restore: contentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [revision] = await ctx.db
        .select()
        .from(cmsContentRevisions)
        .where(eq(cmsContentRevisions.id, input.id))
        .limit(1);

      if (!revision) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Revision not found' });
      }

      const snapshot = revision.snapshot as Record<string, unknown>;

      if (revision.contentType === 'post') {
        await ctx.db
          .update(cmsPosts)
          .set({
            ...snapshot,
            updatedAt: new Date(),
          })
          .where(eq(cmsPosts.id, revision.contentId));
      } else if (revision.contentType === 'category') {
        await ctx.db
          .update(cmsCategories)
          .set({
            ...snapshot,
            updatedAt: new Date(),
          })
          .where(eq(cmsCategories.id, revision.contentId));
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unknown content type: ${revision.contentType}`,
        });
      }

      return { success: true };
    }),
});
