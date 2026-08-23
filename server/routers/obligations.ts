import { z } from "zod";
import { createLegalObligation, getAssignableJacUsers, getCommunitySnapshot, updateLegalObligation } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";

export const obligationsRouter = router({
  snapshot: protectedProcedure.query(() => getCommunitySnapshot()),
  members: jacRoleProcedure(["directiva", "secretario"]).query(() => getAssignableJacUsers()),
  create: jacRoleProcedure(["directiva", "secretario"])
    .input(
      z.object({
        title: z.string().trim().min(5).max(255),
        obligationType: z.string().trim().min(3).max(120),
        legalReference: z.string().trim().min(4).max(255),
        receivingEntity: z.string().trim().max(160).nullable().optional(),
        recurrence: z.enum(["unica", "anual", "semestral", "trimestral"]),
        dueAt: z.coerce.date(),
        responsibleUserId: z.number().int().positive().nullable().optional(),
        supportUrl: z.string().url().max(1000).nullable().optional(),
        notes: z.string().trim().max(3000).nullable().optional(),
      }),
    )
    .mutation(({ input }) => createLegalObligation(input)),
  update: jacRoleProcedure(["directiva", "secretario"])
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["pendiente", "en_proceso", "cumplida", "vencida"]), supportUrl: z.string().url().max(1000).nullable().optional() }))
    .mutation(({ input }) => updateLegalObligation(input)),
});
