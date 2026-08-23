import { eq } from "drizzle-orm";
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
    if (!db) {
      return [
        {
          id: 1,
          code: "AF-001",
          fullName: "Carlos Alberto Rodríguez",
          cedula: "1018456789",
          address: "Calle 75 Sur # 14-20",
          phone: "3109876543",
          commissionName: "Deportes y Recreación",
          status: "activo" as const,
          qrToken: "JAC-BV91-1018456789-DEMO",
          createdAt: new Date(),
          updatedAt: new Date(),
          attendedLastAssembly: true,
        },
      ];
    }
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
      if (db) {
        for (const item of input.affiliates) {
          const qrToken = `JAC-BV91-${item.cedula}-${Date.now().toString(36)}`;
          await db.insert(affiliates).values({
            code: item.code,
            fullName: item.fullName,
            cedula: item.cedula,
            address: item.address || null,
            phone: item.phone || null,
            commissionName: item.commissionName || null,
            qrToken,
            status: "activo",
          });
        }
      } else {
        console.log("[Affiliates] Bulk imported in local mode:", input.affiliates.length);
      }
      return { success: true, count: input.affiliates.length };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.delete(affiliates).where(eq(affiliates.id, input.id));
      } else {
        console.log("[Affiliates] Removed in local mode:", input.id);
      }
      return { success: true };
    }),
});
