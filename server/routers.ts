import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { financeRouter } from "./routers/finance";
import { filesRouter } from "./routers/files";
import { institutionalRouter } from "./routers/institutional";
import { newsRouter } from "./routers/news";
import { obligationsRouter } from "./routers/obligations";
import { reservationsRouter } from "./routers/reservations";
import { workPlanRouter } from "./routers/work-plan";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  institutional: institutionalRouter,
  workPlan: workPlanRouter,
  obligations: obligationsRouter,
  finance: financeRouter,
  files: filesRouter,
  reservations: reservationsRouter,
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
