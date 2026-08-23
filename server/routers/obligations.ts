import { z } from "zod";
import { createLegalObligation, getCommunitySnapshot } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";

export const obligationsRouter = router({
  snapshot: protectedProcedure.query(() => getCommunitySnapshot()),
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
        notes: z.string().trim().max(3000).nullable().optional(),
      }),
    )
    .mutation(({ input }) => createLegalObligation(input)),
});
