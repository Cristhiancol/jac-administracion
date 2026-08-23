import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAffiliatedContext(): TrpcContext {
  return {
    user: {
      id: 10,
      openId: "affiliated-user",
      email: "afiliado@example.com",
      name: "Afiliado de Prueba",
      loginMethod: "manus",
      role: "user",
      jacRole: "afiliado",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("integración RBAC de módulos JAC", () => {
  it("bloquea a un afiliado cuando intenta crear un plan de trabajo", async () => {
    const caller = appRouter.createCaller(createAffiliatedContext());
    await expect(
      caller.workPlan.create({
        title: "Plan no autorizado",
        periodLabel: "2026",
        objective: "Esta operación debe ser rechazada antes de tocar la base de datos.",
        startsAt: new Date("2026-01-01T00:00:00Z"),
        endsAt: new Date("2026-12-31T00:00:00Z"),
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
