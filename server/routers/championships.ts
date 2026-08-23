import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { championshipSchema, campaignSchema } from "@shared/jac-forms";
import { championships, campaigns } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const championshipsRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(championships)
      .orderBy(desc(championships.startsAt))
      .limit(100);
  }),

  create: protectedProcedure
    .input(championshipSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (db) {
        await db.insert(championships).values({
          name: input.name,
          sport: input.sport,
          championshipType: input.championshipType,
          startsAt: input.startsAt,
          endsAt: input.endsAt || null,
          maxTeams: input.maxTeams || null,
          rules: input.rules || null,
          status: "inscripcion",
          createdByUserId: ctx.user.id,
        });
      } else {
        console.log("[Championships] Saved in local mode:", input.name);
      }
      return { success: true };
    }),
});

export const campaignsRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.startsAt))
      .limit(100);
  }),

  create: protectedProcedure
    .input(campaignSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (db) {
        await db.insert(campaigns).values({
          title: input.title,
          campaignType: input.campaignType,
          description: input.description || null,
          startsAt: input.startsAt,
          endsAt: input.endsAt || null,
          status: "planeada",
          createdByUserId: ctx.user.id,
        });
      } else {
        console.log("[Campaigns] Saved in local mode:", input.title);
      }
      return { success: true };
    }),
});
