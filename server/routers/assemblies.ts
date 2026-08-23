import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { assemblySchema, attendanceCheckInSchema } from "@shared/jac-forms";
import { assemblies, assemblyAttendance, affiliates } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

export const assembliesRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(assemblies)
      .orderBy(desc(assemblies.scheduledAt))
      .limit(100);
  }),

  create: protectedProcedure
    .input(assemblySchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const qrCode = `ASM-JAC-BV91-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      if (db) {
        await db.insert(assemblies).values({
          title: input.title,
          assemblyType: input.assemblyType,
          scheduledAt: input.scheduledAt,
          location: input.location || null,
          notes: input.notes || null,
          qrCode,
          status: "programada",
          createdByUserId: ctx.user.id,
        });
      } else {
        console.log("[Assemblies] Saved in local mode:", input.title);
      }
      return { success: true, qrCode };
    }),

  attendance: protectedProcedure
    .input(z.object({ assemblyId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id: assemblyAttendance.id,
          assemblyId: assemblyAttendance.assemblyId,
          affiliateId: assemblyAttendance.affiliateId,
          attended: assemblyAttendance.attended,
          checkedInAt: assemblyAttendance.checkedInAt,
          method: assemblyAttendance.method,
          affiliateName: affiliates.fullName,
          affiliateCedula: affiliates.cedula,
        })
        .from(assemblyAttendance)
        .innerJoin(affiliates, eq(assemblyAttendance.affiliateId, affiliates.id))
        .where(eq(assemblyAttendance.assemblyId, input.assemblyId))
        .orderBy(affiliates.fullName)
        .limit(2000);
    }),

  checkIn: protectedProcedure
    .input(attendanceCheckInSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: true, affiliateName: "Afiliado Local" };

      // Find affiliate by cedula
      const affiliateRows = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.cedula, input.cedula))
        .limit(1);
      const affiliate = affiliateRows[0];
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No se encontró afiliado con cédula ${input.cedula}`,
        });
      }

      // Check if already registered for this assembly
      const existing = await db
        .select()
        .from(assemblyAttendance)
        .where(
          and(
            eq(assemblyAttendance.assemblyId, input.assemblyId),
            eq(assemblyAttendance.affiliateId, affiliate.id),
          ),
        )
        .limit(1);

      if (existing[0]) {
        // Update to attended
        await db
          .update(assemblyAttendance)
          .set({ attended: 1, checkedInAt: new Date(), method: input.method })
          .where(eq(assemblyAttendance.id, existing[0].id));
      } else {
        // Insert new attendance record
        await db.insert(assemblyAttendance).values({
          assemblyId: input.assemblyId,
          affiliateId: affiliate.id,
          attended: 1,
          checkedInAt: new Date(),
          method: input.method,
        });
      }

      return { success: true, affiliateName: affiliate.fullName };
    }),

  initAttendance: protectedProcedure
    .input(z.object({ assemblyId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { created: 0, total: 0 };

      // Get all active affiliates
      const activeAffiliates = await db
        .select({ id: affiliates.id })
        .from(affiliates)
        .where(eq(affiliates.status, "activo"))
        .limit(5000);

      let created = 0;
      for (const aff of activeAffiliates) {
        try {
          await db.insert(assemblyAttendance).values({
            assemblyId: input.assemblyId,
            affiliateId: aff.id,
            attended: 0,
            method: "lista",
          });
          created++;
        } catch {
          // Skip duplicates
        }
      }

      return { created, total: activeAffiliates.length };
    }),
});
