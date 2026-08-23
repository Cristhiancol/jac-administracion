import { TRPCError } from "@trpc/server";
import { financialMovementSchema } from "@shared/jac-forms";
import { z } from "zod";
import { getFinanceSnapshot, recordFinancialMovement, upsertFinancialBudget, getDb } from "../db";
import { jacRoleProcedure, protectedProcedure, router } from "../_core/trpc";
import { financialMovements, facilityReservations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const bulkMovementSchema = z.object({
  movements: z.array(
    z.object({
      movementType: z.enum(["ingreso", "egreso"]),
      category: z.string().min(2).max(120),
      source: z.string().min(1).max(120),
      description: z.string().min(2).max(1000),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
      occurredAt: z.coerce.date(),
      supportUrl: z.string().nullable().optional(),
    })
  ).min(1).max(1000),
});

export const financeRouter = router({
  snapshot: protectedProcedure.query(() => getFinanceSnapshot()),
  
  record: protectedProcedure
    .input(financialMovementSchema)
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return recordFinancialMovement({ ...input, recordedByUserId: ctx.user.id });
    }),

  bulkImport: jacRoleProcedure(["directiva", "tesorero_fiscal"])
    .input(bulkMovementSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const db = await getDb();
      if (db) {
        for (const mov of input.movements) {
          await db.insert(financialMovements).values({
            movementType: mov.movementType,
            category: mov.category,
            source: mov.source,
            description: mov.description,
            amount: mov.amount,
            occurredAt: mov.occurredAt,
            supportUrl: mov.supportUrl || null,
            recordedByUserId: ctx.user.id,
          });
        }
      } else {
        console.log("[Finance] Bulk imported in local mode:", input.movements.length);
      }
      return { success: true, count: input.movements.length };
    }),

  confirmReservationIncome: jacRoleProcedure(["directiva", "tesorero_fiscal"])
    .input(z.object({ reservationId: z.number().int().positive(), receiptCode: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db
          .update(facilityReservations)
          .set({ status: "aprobada", receiptUrl: input.receiptCode || `CONFIRMADO-${Date.now()}` })
          .where(eq(facilityReservations.id, input.reservationId));
      } else {
        console.log("[Finance] Confirmed reservation income in local mode:", input.reservationId);
      }
      return { success: true };
    }),

  setBudget: protectedProcedure
    .input(z.object({ periodLabel: z.string().trim().min(4).max(80), source: z.string().trim().min(2).max(120), approvedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/) }))
    .mutation(({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return upsertFinancialBudget({ ...input, createdByUserId: ctx.user.id });
    }),
});
