import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
});
