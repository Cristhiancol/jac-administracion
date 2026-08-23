import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createWorkPlanActivity: vi.fn().mockResolvedValue(undefined),
  recordFinancialMovement: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createWorkPlanActivity: mocks.createWorkPlanActivity, recordFinancialMovement: mocks.recordFinancialMovement };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createDirectivaContext(): TrpcContext {
  return {
    user: { id: 22, openId: "directiva-test", email: "directiva@example.com", name: "Directiva Test", loginMethod: "manus", role: "user", jacRole: "directiva", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("integración de persistencia tRPC JAC", () => {
  it("envía una actividad validada a la capa de persistencia", async () => {
    const caller = appRouter.createCaller(createDirectivaContext());
    await caller.workPlan.addActivity({ workPlanId: 4, commissionId: 2, responsibleUserId: 22, title: "Jornada de obras", goal: "Completar diagnóstico de la sede", description: null, dueAt: new Date("2026-09-20T00:00:00Z") });
    expect(mocks.createWorkPlanActivity).toHaveBeenCalledWith(expect.objectContaining({ workPlanId: 4, commissionId: 2, responsibleUserId: 22, title: "Jornada de obras" }));
  });

  it("envía un movimiento validado con fuente y relación de actividad", async () => {
    const caller = appRouter.createCaller(createDirectivaContext());
    await caller.finance.record({ movementType: "egreso", category: "Mantenimiento", source: "Aportes comunitarios", description: "Compra de materiales para la sede", amount: "85000", occurredAt: new Date("2026-09-01T00:00:00Z"), activityId: 4, supportUrl: null });
    expect(mocks.recordFinancialMovement).toHaveBeenCalledWith(expect.objectContaining({ activityId: 4, recordedByUserId: 22, source: "Aportes comunitarios" }));
  });
});
