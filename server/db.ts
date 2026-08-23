import { and, desc, eq, gt, inArray, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  commissions,
  facilityReservations,
  financialBudgets,
  financialMovements,
  institutionalNewsItems,
  institutionalNewsSources,
  institutionalProfiles,
  legalObligations,
  users,
  workPlanActivities,
  workPlans,
  type InsertUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { fetchUsmeNews, USME_NEWS_SOURCE_URL } from "./integrations/usme-news";

let _db: ReturnType<typeof drizzle> | null = null;

function ensureDb(database: ReturnType<typeof drizzle> | null) {
  if (!database) {
    throw new Error("DATABASE_UNAVAILABLE");
  }
  return database;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (user.jacRole !== undefined) {
    values.jacRole = user.jacRole;
    updateSet.jacRole = user.jacRole;
  }

  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getInstitutionalProfile() {
  const db = await getDb();
  if (!db) return undefined;
  const profiles = await db
    .select()
    .from(institutionalProfiles)
    .orderBy(desc(institutionalProfiles.updatedAt))
    .limit(1);
  return profiles[0];
}

export async function saveInstitutionalProfile(input: {
  legalName: string;
  nit?: string | null;
  legalRecognition?: string | null;
  communityCode?: string | null;
  officialAddress?: string | null;
  neighborhood?: string | null;
  locality: string;
  latitude?: string | null;
  longitude?: string | null;
  mapEmbedUrl?: string | null;
  verificationStatus: "pendiente" | "verificado" | "observado";
  verificationSourceUrl?: string | null;
  verificationNotes?: string | null;
  verifiedByUserId: number;
}) {
  const db = ensureDb(await getDb());
  const current = await getInstitutionalProfile();
  const values = {
    legalName: input.legalName,
    nit: input.nit || null,
    legalRecognition: input.legalRecognition || null,
    communityCode: input.communityCode || null,
    officialAddress: input.officialAddress || null,
    neighborhood: input.neighborhood || null,
    locality: input.locality,
    latitude: input.latitude || null,
    longitude: input.longitude || null,
    mapEmbedUrl: input.mapEmbedUrl || null,
    verificationStatus: input.verificationStatus,
    verificationSourceUrl: input.verificationSourceUrl || null,
    verificationNotes: input.verificationNotes || null,
    verifiedAt: input.verificationStatus === "verificado" ? new Date() : null,
    verifiedByUserId: input.verificationStatus === "verificado" ? input.verifiedByUserId : null,
  };

  if (current) {
    await db.update(institutionalProfiles).set(values).where(eq(institutionalProfiles.id, current.id));
  } else {
    await db.insert(institutionalProfiles).values(values);
  }

  return getInstitutionalProfile();
}

export async function getCommunitySnapshot() {
  const db = await getDb();
  if (!db) {
    return {
      profile: undefined,
      plans: [],
      activities: [],
      obligations: [],
      movements: [],
      reservations: [],
      news: [],
    };
  }

  const [profile, plans, activities, obligations, movements, reservations, news] = await Promise.all([
    getInstitutionalProfile(),
    db.select().from(workPlans).orderBy(desc(workPlans.updatedAt)).limit(6),
    db.select().from(workPlanActivities).orderBy(workPlanActivities.dueAt).limit(12),
    db.select().from(legalObligations).orderBy(legalObligations.dueAt).limit(12),
    db.select().from(financialMovements).orderBy(desc(financialMovements.occurredAt)).limit(12),
    db.select().from(facilityReservations).orderBy(facilityReservations.startsAt).limit(12),
    db.select().from(institutionalNewsItems).orderBy(desc(institutionalNewsItems.retrievedAt)).limit(6),
  ]);

  return { profile, plans, activities, obligations, movements, reservations, news };
}

import { SEEDED_FINANCIAL_MOVEMENTS } from "@shared/reported-expenses";

export async function getFinanceSnapshot() {
  const db = await getDb();
  if (!db) return { movements: SEEDED_FINANCIAL_MOVEMENTS, budgets: [] };
  const [movements, budgets] = await Promise.all([
    db.select().from(financialMovements).orderBy(desc(financialMovements.occurredAt)).limit(500),
    db.select().from(financialBudgets).orderBy(desc(financialBudgets.updatedAt)).limit(100),
  ]);
  if (movements.length === 0) {
    return { movements: SEEDED_FINANCIAL_MOVEMENTS, budgets };
  }
  return { movements, budgets };
}

export async function getCommissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(commissions).orderBy(commissions.name).limit(30);
}

export async function getAssignableJacUsers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: users.id, name: users.name, email: users.email, jacRole: users.jacRole })
    .from(users)
    .where(inArray(users.jacRole, ["directiva", "coordinador_comite", "tesorero_fiscal", "secretario"] as const))
    .orderBy(users.name)
    .limit(100);
}

export async function createCommission(input: {
  name: string;
  purpose?: string | null;
  coordinatorUserId?: number | null;
}) {
  const db = ensureDb(await getDb());
  await db.insert(commissions).values({
    name: input.name,
    purpose: input.purpose || null,
    coordinatorUserId: input.coordinatorUserId || null,
    active: 1,
  });
}

export async function createWorkPlan(input: {
  title: string;
  periodLabel: string;
  objective: string;
  startsAt: Date;
  endsAt: Date;
  createdByUserId: number;
}) {
  const db = ensureDb(await getDb());
  await db.insert(workPlans).values({ ...input, status: "borrador" });
}

export async function createWorkPlanActivity(input: {
  workPlanId: number;
  commissionId?: number | null;
  responsibleUserId?: number | null;
  title: string;
  goal: string;
  description?: string | null;
  dueAt: Date;
}) {
  const db = ensureDb(await getDb());
  await db.insert(workPlanActivities).values({
    ...input,
    commissionId: input.commissionId || null,
    responsibleUserId: input.responsibleUserId || null,
    description: input.description || null,
    status: "pendiente",
    progress: 0,
  });
}

export async function updateWorkPlanActivity(input: {
  id: number;
  status: "pendiente" | "en_proceso" | "completada" | "bloqueada";
  progress: number;
  evidenceUrl?: string | null;
}) {
  const db = ensureDb(await getDb());
  await db
    .update(workPlanActivities)
    .set({ status: input.status, progress: input.progress, evidenceUrl: input.evidenceUrl || null })
    .where(eq(workPlanActivities.id, input.id));
}

export async function createLegalObligation(input: {
  title: string;
  obligationType: string;
  legalReference: string;
  receivingEntity?: string | null;
  recurrence: "unica" | "anual" | "semestral" | "trimestral";
  dueAt: Date;
  responsibleUserId?: number | null;
  supportUrl?: string | null;
  notes?: string | null;
}) {
  const db = ensureDb(await getDb());
  await db.insert(legalObligations).values({
    ...input,
    receivingEntity: input.receivingEntity || null,
    responsibleUserId: input.responsibleUserId || null,
    supportUrl: input.supportUrl || null,
    notes: input.notes || null,
    status: "pendiente",
  });
}

export async function updateLegalObligation(input: {
  id: number;
  status: "pendiente" | "en_proceso" | "cumplida" | "vencida";
  supportUrl?: string | null;
}) {
  const db = ensureDb(await getDb());
  await db
    .update(legalObligations)
    .set({ status: input.status, supportUrl: input.supportUrl || null })
    .where(eq(legalObligations.id, input.id));
}

export async function recordFinancialMovement(input: {
  movementType: "ingreso" | "egreso";
  category: string;
  source: string;
  description: string;
  amount: string;
  occurredAt: Date;
  activityId?: number | null;
  supportUrl?: string | null;
  recordedByUserId: number;
}) {
  const db = await getDb();
  if (db) {
    await db.insert(financialMovements).values({
      ...input,
      activityId: input.activityId || null,
      supportUrl: input.supportUrl || null,
    });
  } else {
    console.log("[Finance] Saved movement in local mode:", input.category, input.amount);
  }
}

export async function upsertFinancialBudget(input: {
  periodLabel: string;
  source: string;
  approvedAmount: string;
  createdByUserId: number;
}) {
  const db = await getDb();
  if (db) {
    await db.insert(financialBudgets).values(input).onDuplicateKeyUpdate({
      set: { approvedAmount: input.approvedAmount, createdByUserId: input.createdByUserId, updatedAt: new Date() },
    });
  }
}

export async function hasReservationConflict(startsAt: Date, endsAt: Date) {
  const db = await getDb();
  if (!db) return false;
  const conflicts = await db
    .select({ id: facilityReservations.id })
    .from(facilityReservations)
    .where(
      and(
        eq(facilityReservations.status, "aprobada"),
        lt(facilityReservations.startsAt, endsAt),
        gt(facilityReservations.endsAt, startsAt),
      ),
    )
    .limit(1);
  return conflicts.length > 0;
}

export async function createFacilityReservation(input: {
  requestedByUserId: number;
  eventName: string;
  startsAt: Date;
  endsAt: Date;
  applicantType: "afiliado" | "vecino" | "externo";
  amount: string;
}) {
  const db = await getDb();
  if (db) {
    await db.insert(facilityReservations).values({ ...input, status: "solicitada" });
  } else {
    console.log("[Reservations] Saved reservation in local mode:", input.eventName);
  }
}

export async function getNewsSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(institutionalNewsSources).orderBy(institutionalNewsSources.name).limit(10);
}

export async function getNewsSourceByTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const sources = await db
    .select()
    .from(institutionalNewsSources)
    .where(eq(institutionalNewsSources.scheduleCronTaskUid, taskUid))
    .limit(1);
  return sources[0];
}

async function getOrCreateUsmeNewsSource() {
  const db = ensureDb(await getDb());
  const current = await db
    .select()
    .from(institutionalNewsSources)
    .where(eq(institutionalNewsSources.sourceUrl, USME_NEWS_SOURCE_URL))
    .limit(1);
  if (current[0]) return current[0];

  await db.insert(institutionalNewsSources).values({
    name: "Alcaldía Local de Usme",
    sourceUrl: USME_NEWS_SOURCE_URL,
    official: 1,
    validationStatus: "verificado",
  });
  const created = await db
    .select()
    .from(institutionalNewsSources)
    .where(eq(institutionalNewsSources.sourceUrl, USME_NEWS_SOURCE_URL))
    .limit(1);
  if (!created[0]) throw new Error("USME_SOURCE_CREATE_FAILED");
  return created[0];
}

export async function synchronizeUsmeNews(sourceId?: number) {
  const db = ensureDb(await getDb());
  const source = sourceId
    ? (await db.select().from(institutionalNewsSources).where(eq(institutionalNewsSources.id, sourceId)).limit(1))[0]
    : await getOrCreateUsmeNewsSource();
  if (!source) throw new Error("USME_SOURCE_NOT_FOUND");
  if (source.sourceUrl !== USME_NEWS_SOURCE_URL || source.official !== 1 || source.validationStatus !== "verificado") {
    throw new Error("USME_SOURCE_NOT_VALIDATED");
  }

  const candidates = await fetchUsmeNews();
  for (const item of candidates) {
    await db.insert(institutionalNewsItems).values({
      sourceId: source.id,
      externalId: item.externalId,
      title: item.title,
      summary: item.summary,
      sourceUrl: item.sourceUrl,
      publishedAt: item.publishedAt,
      retrievedAt: new Date(),
      validationStatus: "verificado",
    }).onDuplicateKeyUpdate({
      set: { title: item.title, summary: item.summary, sourceUrl: item.sourceUrl, publishedAt: item.publishedAt, retrievedAt: new Date(), validationStatus: "verificado" },
    });
  }
  await db.update(institutionalNewsSources).set({ lastCheckedAt: new Date() }).where(eq(institutionalNewsSources.id, source.id));
  return { imported: candidates.length, sourceUrl: source.sourceUrl };
}
