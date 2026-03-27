import { createTRPCRouter } from '../trpc';
import { authRouter } from './auth';
import { categoriesRouter } from './categories';
import { cmsRouter } from './cms';
import { mediaRouter } from './media';

/**
 * Root tRPC router — combines all sub-routers
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  cms: cmsRouter,
  categories: categoriesRouter,
  media: mediaRouter,
});

export type AppRouter = typeof appRouter;
