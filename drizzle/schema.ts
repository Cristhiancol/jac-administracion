import {
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  jacRole: mysqlEnum("jacRole", [
    "directiva",
    "coordinador_comite",
    "tesorero_fiscal",
    "secretario",
    "afiliado",
  ])
    .default("afiliado")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const institutionalProfiles = mysqlTable(
  "institutionalProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    legalName: varchar("legalName", { length: 255 }).notNull(),
    nit: varchar("nit", { length: 20 }),
    legalRecognition: varchar("legalRecognition", { length: 255 }),
    communityCode: varchar("communityCode", { length: 80 }),
    officialAddress: text("officialAddress"),
    neighborhood: varchar("neighborhood", { length: 160 }),
    locality: varchar("locality", { length: 120 }).notNull().default("Usme"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    mapEmbedUrl: varchar("mapEmbedUrl", { length: 2000 }),
    verificationStatus: mysqlEnum("verificationStatus", ["pendiente", "verificado", "observado"])
      .notNull()
      .default("pendiente"),
    verificationSourceUrl: varchar("verificationSourceUrl", { length: 1000 }),
    verificationNotes: text("verificationNotes"),
    verifiedAt: timestamp("verifiedAt"),
    verifiedByUserId: int("verifiedByUserId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("institutional_profile_status_idx").on(table.verificationStatus)],
);

export const commissions = mysqlTable(
  "commissions",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    purpose: text("purpose"),
    coordinatorUserId: int("coordinatorUserId"),
    active: int("active").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("commission_name_unique").on(table.name)],
);

export const workPlans = mysqlTable(
  "workPlans",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    periodLabel: varchar("periodLabel", { length: 80 }).notNull(),
    objective: text("objective").notNull(),
    status: mysqlEnum("status", ["borrador", "activo", "cerrado"]).notNull().default("borrador"),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt").notNull(),
    createdByUserId: int("createdByUserId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("work_plan_period_idx").on(table.periodLabel, table.status)],
);

export const workPlanActivities = mysqlTable(
  "workPlanActivities",
  {
    id: int("id").autoincrement().primaryKey(),
    workPlanId: int("workPlanId").notNull(),
    commissionId: int("commissionId"),
    responsibleUserId: int("responsibleUserId"),
    title: varchar("title", { length: 255 }).notNull(),
    goal: text("goal").notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["pendiente", "en_proceso", "completada", "bloqueada"])
      .notNull()
      .default("pendiente"),
    progress: int("progress").notNull().default(0),
    dueAt: timestamp("dueAt").notNull(),
    evidenceUrl: varchar("evidenceUrl", { length: 1000 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("activity_plan_idx").on(table.workPlanId, table.status),
    index("activity_commission_idx").on(table.commissionId, table.dueAt),
  ],
);

export const legalObligations = mysqlTable(
  "legalObligations",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    obligationType: varchar("obligationType", { length: 120 }).notNull(),
    legalReference: varchar("legalReference", { length: 255 }).notNull(),
    receivingEntity: varchar("receivingEntity", { length: 160 }),
    recurrence: mysqlEnum("recurrence", ["unica", "anual", "semestral", "trimestral"])
      .notNull()
      .default("unica"),
    dueAt: timestamp("dueAt").notNull(),
    responsibleUserId: int("responsibleUserId"),
    status: mysqlEnum("status", ["pendiente", "en_proceso", "cumplida", "vencida"])
      .notNull()
      .default("pendiente"),
    supportUrl: varchar("supportUrl", { length: 1000 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("legal_obligation_due_idx").on(table.dueAt, table.status)],
);

export const financialMovements = mysqlTable(
  "financialMovements",
  {
    id: int("id").autoincrement().primaryKey(),
    movementType: mysqlEnum("movementType", ["ingreso", "egreso"]).notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    source: varchar("source", { length: 120 }).notNull().default("Sin fuente"),
    description: text("description").notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    occurredAt: timestamp("occurredAt").notNull(),
    activityId: int("activityId"),
    supportUrl: varchar("supportUrl", { length: 1000 }),
    recordedByUserId: int("recordedByUserId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("financial_movement_period_idx").on(table.occurredAt, table.movementType)],
);

export const financialBudgets = mysqlTable(
  "financialBudgets",
  {
    id: int("id").autoincrement().primaryKey(),
    periodLabel: varchar("periodLabel", { length: 80 }).notNull(),
    source: varchar("source", { length: 120 }).notNull(),
    approvedAmount: decimal("approvedAmount", { precision: 14, scale: 2 }).notNull(),
    createdByUserId: int("createdByUserId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("financial_budget_period_source_unique").on(table.periodLabel, table.source)],
);

export const facilityReservations = mysqlTable(
  "facilityReservations",
  {
    id: int("id").autoincrement().primaryKey(),
    requestedByUserId: int("requestedByUserId").notNull(),
    eventName: varchar("eventName", { length: 255 }).notNull(),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt").notNull(),
    applicantType: mysqlEnum("applicantType", ["afiliado", "vecino", "externo"]).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
    status: mysqlEnum("status", ["solicitada", "aprobada", "rechazada", "cancelada"])
      .notNull()
      .default("solicitada"),
    receiptUrl: varchar("receiptUrl", { length: 1000 }),
    reviewedByUserId: int("reviewedByUserId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("facility_reservation_range_idx").on(table.startsAt, table.endsAt, table.status)],
);

export const institutionalNewsSources = mysqlTable(
  "institutionalNewsSources",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    sourceUrl: varchar("sourceUrl", { length: 1000 }).notNull(),
    official: int("official").notNull().default(0),
    validationStatus: mysqlEnum("validationStatus", ["pendiente", "verificado", "observado"])
      .notNull()
      .default("pendiente"),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
    lastCheckedAt: timestamp("lastCheckedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("news_source_task_idx").on(table.scheduleCronTaskUid)],
);

export const institutionalNewsItems = mysqlTable(
  "institutionalNewsItems",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceId: int("sourceId").notNull(),
    externalId: varchar("externalId", { length: 255 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    summary: text("summary"),
    sourceUrl: varchar("sourceUrl", { length: 1000 }).notNull(),
    publishedAt: timestamp("publishedAt"),
    retrievedAt: timestamp("retrievedAt").defaultNow().notNull(),
    validationStatus: mysqlEnum("validationStatus", ["pendiente", "verificado", "observado"])
      .notNull()
      .default("pendiente"),
  },
  table => [
    uniqueIndex("news_item_external_unique").on(table.sourceId, table.externalId),
    index("news_item_published_idx").on(table.publishedAt),
  ],
);

export type InstitutionalProfile = typeof institutionalProfiles.$inferSelect;
export type InsertInstitutionalProfile = typeof institutionalProfiles.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type WorkPlan = typeof workPlans.$inferSelect;
export type WorkPlanActivity = typeof workPlanActivities.$inferSelect;
export type LegalObligation = typeof legalObligations.$inferSelect;
export type FinancialMovement = typeof financialMovements.$inferSelect;
export type FinancialBudget = typeof financialBudgets.$inferSelect;
export type FacilityReservation = typeof facilityReservations.$inferSelect;
export type InstitutionalNewsSource = typeof institutionalNewsSources.$inferSelect;
export type InstitutionalNewsItem = typeof institutionalNewsItems.$inferSelect;
