import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { affiliateSchema } from "@shared/jac-forms";
import { affiliates } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

const bulkAffiliateSchema = z.object({
  affiliates: z.array(affiliateSchema).min(1).max(500),
});

export const affiliatesRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(affiliates)
      .orderBy(affiliates.fullName)
      .limit(2000);
  }),

  create: protectedProcedure
    .input(affiliateSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      const qrToken = `JAC-BV91-${input.cedula}-${Date.now().toString(36)}`;
      if (db) {
        await db.insert(affiliates).values({
          code: input.code,
          fullName: input.fullName,
          cedula: input.cedula,
          address: input.address || null,
          phone: input.phone || null,
          commissionName: input.commissionName || null,
          qrToken,
          status: "activo",
        });
      } else {
        console.log("[Affiliates] Saved in local mode:", input.fullName);
      }
      return { success: true };
    }),

  bulkImport: protectedProcedure
    .input(bulkAffiliateSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      let imported = 0;
      for (const row of input.affiliates) {
        const qrToken = `JAC-BV91-${row.cedula}-${Date.now().toString(36)}`;
        if (db) {
          try {
            await db.insert(affiliates).values({
              code: row.code,
              fullName: row.fullName,
              cedula: row.cedula,
              address: row.address || null,
              phone: row.phone || null,
              commissionName: row.commissionName || null,
              qrToken,
              status: "activo",
            });
            imported++;
          } catch {
            // Skip duplicates (unique cedula constraint)
          }
        } else {
          imported++;
        }
      }
      return { imported, total: input.affiliates.length };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.delete(affiliates).where(eq(affiliates.id, input.id));
      }
      return { success: true };
    }),

  getByCedula: protectedProcedure
    .input(z.object({ cedula: z.string().trim().min(5) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const results = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.cedula, input.cedula))
        .limit(1);
      return results[0] ?? null;
    }),
});
