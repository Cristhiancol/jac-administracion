import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { affiliatesRouter } from "./routers/affiliates";
import { assembliesRouter } from "./routers/assemblies";
import { campaignsRouter, championshipsRouter } from "./routers/championships";
import { financeRouter } from "./routers/finance";
import { filesRouter } from "./routers/files";
import { institutionalRouter } from "./routers/institutional";
import { newsRouter } from "./routers/news";
import { obligationsRouter } from "./routers/obligations";
import { reservationsRouter } from "./routers/reservations";
import { workPlanRouter } from "./routers/work-plan";

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getUserByOpenId, upsertUser } from "./db";
import { sdk } from "./_core/sdk";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    adminLogin: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const emailLower = input.email.toLowerCase();
        if (
          input.password !== "cristhian2026" &&
          input.password !== "admin2026" &&
          input.password !== "123456" &&
          input.password.length < 4
        ) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Clave de administrador incorrecta." });
        }

        const openId = `admin_${emailLower.replace(/[^a-z0-9]/g, "_")}`;
        await upsertUser({
          openId,
          name: emailLower.includes("cristhian") ? "Cristhian Benitez" : "Administrador Directiva",
          email: input.email,
          role: "admin",
          jacRole: "directiva",
          loginMethod: "password",
        });

        const user = await getUserByOpenId(openId);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al iniciar sesión." });

        const token = await sdk.createSessionToken(openId, { name: user.name || "Admin" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return {
          success: true,
          user,
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  affiliates: affiliatesRouter,
  assemblies: assembliesRouter,
  championships: championshipsRouter,
  campaigns: campaignsRouter,
  institutional: institutionalRouter,
  workPlan: workPlanRouter,
  obligations: obligationsRouter,
  finance: financeRouter,
  files: filesRouter,
  reservations: reservationsRouter,
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
