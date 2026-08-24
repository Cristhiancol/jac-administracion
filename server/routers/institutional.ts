import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { institutionalProfileSchema } from "@shared/jac-forms";
import { getInstitutionalProfile, saveInstitutionalProfile, getJacDignatarios, updateUserJacRole } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";

export const institutionalRouter = router({
  get: protectedProcedure.query(() => getInstitutionalProfile()),
  save: jacRoleProcedure(["directiva"])
    .input(institutionalProfileSchema)
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return saveInstitutionalProfile({ ...input, verifiedByUserId: ctx.user.id });
    }),
  dignatarios: protectedProcedure.query(() => getJacDignatarios()),
  assignRole: protectedProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        jacRole: z.enum(["directiva", "coordinador_comite", "tesorero_fiscal", "secretario", "afiliado"]),
        role: z.enum(["user", "admin"]),
        isAffiliate: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await updateUserJacRole(input.userId, input.jacRole, input.role, input.isAffiliate);
      return { success: true };
    }),
});
