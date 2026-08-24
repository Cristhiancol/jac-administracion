import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function createAdminCaller() {
  return appRouter.createCaller({
    user: {
      id: 1,
      openId: "admin-user-001",
      name: "Presidente Directiva JAC Bellavista",
      email: "directiva@bellavista1991.org",
      role: "admin",
      jacRole: "directiva",
      loginMethod: "google",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as any,
    res: {} as any,
  });
}

function createUserCaller() {
  return appRouter.createCaller({
    user: {
      id: 99,
      openId: "standard-user-099",
      name: "Vecino Afiliado General",
      email: "vecino@bellavista1991.org",
      role: "user",
      jacRole: "afiliado",
      loginMethod: "google",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as any,
    res: {} as any,
  });
}

describe("Auditoría de Gobernabilidad, Control de Usuarios y Registro QR de Asambleas", () => {
  it("permite a la Directiva consultar y asignar cargos administrativos a dignatarios", async () => {
    const adminCaller = createAdminCaller();
    const dignatarios = await adminCaller.institutional.dignatarios();
    expect(dignatarios).toBeDefined();
    expect(dignatarios.length).toBeGreaterThan(0);

    const assignResult = await adminCaller.institutional.assignRole({
      userId: 1,
      jacRole: "directiva",
      role: "admin",
    });
    expect(assignResult.success).toBe(true);
  });

  it("verifica el control de acceso RBAC: usuarios no administradores no pueden modificar la ficha legal", async () => {
    const userCaller = createUserCaller();
    await expect(
      userCaller.institutional.save({
        legalName: "JAC Hackeada",
        locality: "Usme",
        verificationStatus: "verificado",
      })
    ).rejects.toThrow();
  });

  it("permite la creación de asambleas y la generación automática de código QR de asistencia", async () => {
    const adminCaller = createAdminCaller();
    const assemblyResult = await adminCaller.assemblies.create({
      title: "Asamblea Ordinaria General 30 de Agosto",
      assemblyType: "ordinaria",
      scheduledAt: new Date("2026-08-30T14:00:00Z"),
      location: "Salón Comunal Bellavista 1991",
      notes: "Elección de comité de deportes y aprobación de presupuesto",
    });

    expect(assemblyResult.success).toBe(true);
    expect(assemblyResult.qrCode).toContain("ASM-JAC-BV91-");
  });

  it("valida la alerta automática para afiliados con 3 o más inasistencias a asambleas", async () => {
    const adminCaller = createAdminCaller();
    const report = await adminCaller.assemblies.absencesReport();

    expect(report).toBeDefined();
    // All items in the report must have at least 3 absences and requiresAction = true
    report.forEach((aff) => {
      expect(aff.absences).toBeGreaterThanOrEqual(3);
      expect(aff.requiresAction).toBe(true);
    });
  });

  it("confirma que las solicitudes de reserva de salón generan recaudos y requieren confirmación de la tesorería", async () => {
    const adminCaller = createAdminCaller();
    const reservationResult = await adminCaller.reservations.create({
      eventName: "Celebración Comunitaria Día de la Familia",
      startsAt: new Date("2026-09-20T10:00:00Z"),
      endsAt: new Date("2026-09-20T18:00:00Z"),
      applicantType: "afiliado",
      amount: "30000",
    });

    expect(reservationResult.success).toBe(true);

    const confirmResult = await adminCaller.finance.confirmReservationIncome({
      reservationId: 1,
      receiptCode: "RECIBO-JAC-00892",
    });
    expect(confirmResult.success).toBe(true);
  });
});
