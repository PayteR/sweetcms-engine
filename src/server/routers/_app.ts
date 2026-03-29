import { createTRPCRouter } from '../trpc';
import { auditRouter } from './audit';
import { authRouter } from './auth';
import { categoriesRouter } from './categories';
import { cmsRouter } from './cms';
import { contentSearchRouter } from './content-search';
import { mediaRouter } from './media';
import { menusRouter } from './menus';
import { optionsRouter } from './options';
import { revisionsRouter } from './revisions';
import { tagsRouter } from './tags';
import { usersRouter } from './users';
import { webhooksRouter } from './webhooks';

/**
 * Root tRPC router — combines all sub-routers
 */
export const appRouter = createTRPCRouter({
  audit: auditRouter,
  auth: authRouter,
  cms: cmsRouter,
  categories: categoriesRouter,
  contentSearch: contentSearchRouter,
  media: mediaRouter,
  menus: menusRouter,
  options: optionsRouter,
  revisions: revisionsRouter,
  tags: tagsRouter,
  users: usersRouter,
  webhooks: webhooksRouter,
});

export type AppRouter = typeof appRouter;
