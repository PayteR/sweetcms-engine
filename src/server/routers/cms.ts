import { TRPCError } from '@trpc/server';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

import { getContentTypeByPostType } from '@/config/cms';
import { cmsPosts } from '@/server/db/schema';
import { ContentStatus, PostType } from '@/types/cms';
import {
  buildAdminList,
  buildStatusCounts,
  ensureSlugUnique,
  softDelete,
  softRestore,
  permanentDelete,
} from '@/server/utils/admin-crud';
import { updateWithRevision } from '@/server/utils/cms-helpers';
import {
  createTRPCRouter,
  publicProcedure,
  sectionProcedure,
} from '../trpc';

const contentProcedure = sectionProcedure('content');

const POST_SNAPSHOT_KEYS = [
  'title',
  'slug',
  'content',
  'status',
  'metaDescription',
  'seoTitle',
  'featuredImage',
  'featuredImageAlt',
  'jsonLd',
  'noindex',
  'publishedAt',
  'lang',
] as const;

const crudCols = {
  table: cmsPosts,
  id: cmsPosts.id,
  deleted_at: cmsPosts.deletedAt,
};

export const cmsRouter = createTRPCRouter({
  /** List posts with search, pagination, status tabs */
  list: contentProcedure
    .input(
      z.object({
        type: z.number().int().min(1),
        search: z.string().max(200).optional(),
        trashed: z.boolean().optional(),
        lang: z.string().max(2).optional(),
        sortBy: z.string().optional(),
        sortDir: z.enum(['asc', 'desc']).optional(),
        page: z.number().int().min(1).optional(),
        pageSize: z.number().int().min(1).max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return buildAdminList(
        {
          db: ctx.db,
          cols: {
            table: cmsPosts,
            id: cmsPosts.id,
            deleted_at: cmsPosts.deletedAt,
            lang: cmsPosts.lang,
            translation_group: cmsPosts.translationGroup,
          },
          input,
          searchColumns: [cmsPosts.title, cmsPosts.slug],
          sortColumns: {
            title: cmsPosts.title,
            created_at: cmsPosts.createdAt,
            updated_at: cmsPosts.updatedAt,
            published_at: cmsPosts.publishedAt,
          },
          defaultSort: 'updated_at',
          extraConditions: [eq(cmsPosts.type, input.type)],
        },
        async ({ where, orderBy, offset, limit }) => {
          return ctx.db
            .select()
            .from(cmsPosts)
            .where(where)
            .orderBy(orderBy)
            .offset(offset)
            .limit(limit);
        }
      );
    }),

  /** Status tab counts */
  counts: contentProcedure
    .input(z.object({ type: z.number().int().min(1) }))
    .query(async ({ ctx, input }) => {
      return buildStatusCounts(
        ctx.db,
        {
          table: cmsPosts,
          status: cmsPosts.status,
          deleted_at: cmsPosts.deletedAt,
        },
        eq(cmsPosts.type, input.type)
      );
    }),

  /** Get single post by ID */
  get: contentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .select()
        .from(cmsPosts)
        .where(eq(cmsPosts.id, input.id))
        .limit(1);

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }
      return post;
    }),

  /** Create a new post */
  create: contentProcedure
    .input(
      z.object({
        type: z.number().int().min(1),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        lang: z.string().min(2).max(2),
        content: z.string().default(''),
        status: z.number().int().default(ContentStatus.DRAFT),
        metaDescription: z.string().max(500).optional(),
        seoTitle: z.string().max(100).optional(),
        featuredImage: z.string().max(1024).optional(),
        featuredImageAlt: z.string().max(500).optional(),
        jsonLd: z.string().optional(),
        noindex: z.boolean().default(false),
        publishedAt: z.string().datetime().optional(),
        translationGroup: z.string().uuid().optional(),
        fallbackToDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contentType = getContentTypeByPostType(input.type);

      await ensureSlugUnique(
        ctx.db,
        {
          table: cmsPosts,
          slugCol: cmsPosts.slug,
          slug: input.slug,
          langCol: cmsPosts.lang,
          lang: input.lang,
          deletedAtCol: cmsPosts.deletedAt,
          extraConditions: [eq(cmsPosts.type, input.type)],
        },
        contentType.label
      );

      const previewToken = crypto.randomBytes(32).toString('hex');

      const [post] = await ctx.db
        .insert(cmsPosts)
        .values({
          type: input.type,
          title: input.title,
          slug: input.slug,
          lang: input.lang,
          content: input.content,
          status: input.status,
          metaDescription: input.metaDescription ?? null,
          seoTitle: input.seoTitle ?? null,
          featuredImage: input.featuredImage ?? null,
          featuredImageAlt: input.featuredImageAlt ?? null,
          jsonLd: input.jsonLd ?? null,
          noindex: input.noindex,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          previewToken,
          translationGroup: input.translationGroup ?? null,
          fallbackToDefault: input.fallbackToDefault ?? null,
          authorId: ctx.session.user.id as string,
        })
        .returning();

      return post!;
    }),

  /** Update a post */
  update: contentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).optional(),
        content: z.string().optional(),
        status: z.number().int().optional(),
        metaDescription: z.string().max(500).optional().nullable(),
        seoTitle: z.string().max(100).optional().nullable(),
        featuredImage: z.string().max(1024).optional().nullable(),
        featuredImageAlt: z.string().max(500).optional().nullable(),
        jsonLd: z.string().optional().nullable(),
        noindex: z.boolean().optional(),
        publishedAt: z.string().datetime().optional().nullable(),
        translationGroup: z.string().uuid().optional().nullable(),
        fallbackToDefault: z.boolean().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [existing] = await ctx.db
        .select()
        .from(cmsPosts)
        .where(eq(cmsPosts.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      const contentType = getContentTypeByPostType(existing.type);

      if (updates.slug && updates.slug !== existing.slug) {
        await ensureSlugUnique(
          ctx.db,
          {
            table: cmsPosts,
            slugCol: cmsPosts.slug,
            slug: updates.slug,
            idCol: cmsPosts.id,
            excludeId: id,
            langCol: cmsPosts.lang,
            lang: existing.lang,
            deletedAtCol: cmsPosts.deletedAt,
            extraConditions: [eq(cmsPosts.type, existing.type)],
          },
          contentType.label
        );
      }

      await updateWithRevision({
        db: ctx.db,
        contentType: contentType.id,
        contentId: id,
        oldRecord: existing,
        snapshotKeys: [...POST_SNAPSHOT_KEYS],
        userId: ctx.session.user.id as string,
        oldSlug: existing.slug,
        newSlug: updates.slug,
        urlPrefix: contentType.urlPrefix,
        doUpdate: async (db) => {
          await db
            .update(cmsPosts)
            .set({
              ...updates,
              publishedAt: updates.publishedAt !== undefined
                ? updates.publishedAt
                  ? new Date(updates.publishedAt)
                  : null
                : undefined,
              updatedAt: new Date(),
            })
            .where(eq(cmsPosts.id, id));
        },
      });

      return { success: true };
    }),

  /** Soft-delete (trash) a post */
  delete: contentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await softDelete(ctx.db, crudCols, input.id);
      return { success: true };
    }),

  /** Restore from trash */
  restore: contentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await softRestore(ctx.db, crudCols, input.id);
      return { success: true };
    }),

  /** Permanently delete a trashed post */
  permanentDelete: contentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Find the content type from the post
      const [post] = await ctx.db
        .select({ type: cmsPosts.type })
        .from(cmsPosts)
        .where(eq(cmsPosts.id, input.id))
        .limit(1);

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      const contentType = getContentTypeByPostType(post.type);
      await permanentDelete(ctx.db, crudCols, input.id, contentType.id);
      return { success: true };
    }),

  /** Public: get a published post by slug */
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().max(255),
        type: z.number().int().min(1),
        lang: z.string().max(2).default('en'),
      })
    )
    .query(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .select()
        .from(cmsPosts)
        .where(
          and(
            eq(cmsPosts.slug, input.slug),
            eq(cmsPosts.type, input.type),
            eq(cmsPosts.lang, input.lang),
            eq(cmsPosts.status, ContentStatus.PUBLISHED),
            isNull(cmsPosts.deletedAt)
          )
        )
        .limit(1);

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }
      return post;
    }),

  /** Public: list published posts */
  listPublished: publicProcedure
    .input(
      z.object({
        type: z.number().int().min(1),
        lang: z.string().max(2).default('en'),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.pageSize;

      const [items, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(cmsPosts)
          .where(
            and(
              eq(cmsPosts.type, input.type),
              eq(cmsPosts.lang, input.lang),
              eq(cmsPosts.status, ContentStatus.PUBLISHED),
              isNull(cmsPosts.deletedAt)
            )
          )
          .orderBy(desc(cmsPosts.publishedAt))
          .offset(offset)
          .limit(input.pageSize),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(cmsPosts)
          .where(
            and(
              eq(cmsPosts.type, input.type),
              eq(cmsPosts.lang, input.lang),
              eq(cmsPosts.status, ContentStatus.PUBLISHED),
              isNull(cmsPosts.deletedAt)
            )
          ),
      ]);

      const total = Number(countResult[0]?.count ?? 0);
      return {
        results: items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),
});
