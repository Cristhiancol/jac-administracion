import { TRPCError } from "@trpc/server";
import { financialMovementSchema } from "@shared/jac-forms";
import { z } from "zod";
import { getFinanceSnapshot, recordFinancialMovement, upsertFinancialBudget } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";

export const financeRouter = router({
  snapshot: protectedProcedure.query(() => getFinanceSnapshot()),
  record: jacRoleProcedure(["directiva", "tesorero_fiscal"])
    .input(financialMovementSchema)
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return recordFinancialMovement({ ...input, recordedByUserId: ctx.user.id });
    }),
  setBudget: jacRoleProcedure(["directiva", "tesorero_fiscal"])
    .input(z.object({ periodLabel: z.string().trim().min(4).max(80), source: z.string().trim().min(2).max(120), approvedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/) }))
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return upsertFinancialBudget({ ...input, createdByUserId: ctx.user.id });
    }),
});
