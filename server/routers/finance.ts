import { TRPCError } from "@trpc/server";
import { financialMovementSchema } from "@shared/jac-forms";
import { getCommunitySnapshot, recordFinancialMovement } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";

export const financeRouter = router({
  snapshot: protectedProcedure.query(() => getCommunitySnapshot()),
  record: jacRoleProcedure(["directiva", "tesorero_fiscal"])
    .input(financialMovementSchema)
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return recordFinancialMovement({ ...input, recordedByUserId: ctx.user.id });
    }),
});
