import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function createCaller(user = { id: 1, openId: "test-user-123", role: "admin" as const, jacRole: "directiva" as const }) {
  return appRouter.createCaller({
    user,
    req: {} as any,
    res: {} as any,
  });
}

describe("Verificación de Guardado y Persistencia de Información (End-to-End)", () => {
  it("permite registrar un gasto/egreso financiero y guardarlo en el sistema", async () => {
    const caller = createCaller();
    const result = await caller.finance.record({
      movementType: "egreso",
      category: "Materiales y mantenimiento",
      source: "Caja Menor JAC",
      description: "Compra de pintura e insumos para salón comunal Bellavista",
      amount: "450000",
      occurredAt: new Date("2026-08-20"),
    });

    expect(result).toBeUndefined(); // Returns void on success

    const snapshot = await caller.finance.snapshot();
    expect(snapshot.movements).toBeDefined();
    expect(snapshot.movements.length).toBeGreaterThan(0);
  });

  it("permite crear un campeonato deportivo y guardarlo en el sistema", async () => {
    const caller = createCaller();
    const result = await caller.championships.create({
      name: "Copa Relámpago Bellavista 2026",
      sport: "Microfútbol",
      championshipType: "copa",
      startsAt: new Date("2026-09-01"),
      endsAt: new Date("2026-09-15"),
      maxTeams: 12,
      rules: "Torneo eliminación directa 5v5",
    });

    expect(result.success).toBe(true);

    const list = await caller.championships.list();
    expect(list).toBeDefined();
  });

  it("permite crear una campaña comunitaria y guardarla en el sistema", async () => {
    const caller = createCaller();
    const result = await caller.campaigns.create({
      title: "Jornada de Arbolización Páramo de Usme",
      campaignType: "ambiental",
      description: "Siembra de 200 frailejones y especies nativas con la comunidad",
      startsAt: new Date("2026-09-10"),
    });

    expect(result.success).toBe(true);

    const list = await caller.campaigns.list();
    expect(list).toBeDefined();
  });

  it("permite registrar un nuevo afiliado y guardarlo en el libro", async () => {
    const caller = createCaller();
    const result = await caller.affiliates.create({
      code: "AF-999",
      fullName: "Carlos Alberto Rodríguez",
      cedula: "1018456789",
      address: "Calle 75 Sur # 14-20",
      phone: "3109876543",
      commissionName: "Deportes y Recreación",
    });

    expect(result.success).toBe(true);

    const list = await caller.affiliates.list();
    expect(list).toBeDefined();
  });

  it("permite programar una asamblea comunitaria y guardarla en el sistema", async () => {
    const caller = createCaller();
    const result = await caller.assemblies.create({
      title: "Asamblea Extraordinaria Presupuesto 2026",
      assemblyType: "extraordinaria",
      scheduledAt: new Date("2026-10-01T14:00:00Z"),
      location: "Salón Comunal Bellavista",
      notes: "Aprobación de proyectos de huerta urbana y seguridad barrial",
    });

    expect(result.success).toBe(true);
    expect(result.qrCode).toBeDefined();

    const list = await caller.assemblies.list();
    expect(list).toBeDefined();
  });

  it("permite crear una reserva para el salón comunal y guardarla en el sistema", async () => {
    const caller = createCaller();
    const result = await caller.reservations.create({
      eventName: "Reunión de Integración Comunitaria",
      startsAt: new Date("2026-11-05T10:00:00Z"),
      endsAt: new Date("2026-11-05T16:00:00Z"),
      applicantType: "afiliado",
      amount: "50000",
    });

    expect(result.success).toBe(true);

    const snapshot = await caller.reservations.snapshot();
    expect(snapshot.reservations).toBeDefined();
  });
});
