import { TRPCError } from "@trpc/server";
import { institutionalProfileSchema } from "@shared/jac-forms";
import { getInstitutionalProfile, saveInstitutionalProfile } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";

export const institutionalRouter = router({
  get: protectedProcedure.query(() => getInstitutionalProfile()),
  save: jacRoleProcedure(["directiva"])
    .input(institutionalProfileSchema)
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return saveInstitutionalProfile({ ...input, verifiedByUserId: ctx.user.id });
    }),
});
