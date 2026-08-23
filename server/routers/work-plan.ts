import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCommission, createWorkPlan, createWorkPlanActivity, getAssignableJacUsers, getCommunitySnapshot, getCommissions, updateWorkPlanActivity } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";

export const workPlanRouter = router({
  snapshot: protectedProcedure.query(() => getCommunitySnapshot()),
  commissions: protectedProcedure.query(() => getCommissions()),
  members: jacRoleProcedure(["directiva", "coordinador_comite"]).query(() => getAssignableJacUsers()),
  createCommission: jacRoleProcedure(["directiva", "coordinador_comite"])
    .input(z.object({ name: z.string().trim().min(3).max(160), purpose: z.string().trim().max(1000).nullable().optional() }))
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return createCommission({ ...input, coordinatorUserId: ctx.user.id });
    }),
  create: jacRoleProcedure(["directiva", "coordinador_comite"])
    .input(
      z.object({
        title: z.string().trim().min(5).max(255),
        periodLabel: z.string().trim().min(4).max(80),
        objective: z.string().trim().min(10).max(2000),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return createWorkPlan({ ...input, createdByUserId: ctx.user.id });
    }),
  addActivity: jacRoleProcedure(["directiva", "coordinador_comite"])
    .input(
      z.object({
        workPlanId: z.number().int().positive(),
        commissionId: z.number().int().positive().nullable().optional(),
        responsibleUserId: z.number().int().positive().nullable().optional(),
        title: z.string().trim().min(4).max(255),
        goal: z.string().trim().min(5).max(2000),
        description: z.string().trim().max(3000).nullable().optional(),
        dueAt: z.coerce.date(),
      }),
    )
    .mutation(({ input }) => createWorkPlanActivity(input)),
  updateActivity: jacRoleProcedure(["directiva", "coordinador_comite"])
    .input(z.object({ id: z.number().int().positive(), progress: z.number().int().min(0).max(100), status: z.enum(["pendiente", "en_proceso", "completada", "bloqueada"]), evidenceUrl: z.string().url().max(1000).nullable().optional() }))
    .mutation(({ input }) => updateWorkPlanActivity(input)),
});
