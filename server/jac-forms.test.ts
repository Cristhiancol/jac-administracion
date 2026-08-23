import { describe, expect, it } from "vitest";
import { canAccessJacRole } from "@shared/jac-access";
import { financialMovementSchema, institutionalProfileSchema, reservationSchema } from "@shared/jac-forms";

describe("validación de formularios y permisos JAC", () => {
  it("acepta una ficha institucional pendiente de verificación sin NIT o dirección simulados", () => {
    const result = institutionalProfileSchema.safeParse({
      legalName: "Junta de Acción Comunal Barrio Usme Centro / Localidad de Usme",
      nit: null,
      officialAddress: null,
      locality: "Usme",
      verificationStatus: "pendiente",
      verificationSourceUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza la URL de soporte institucional que no sea válida", () => {
    const result = institutionalProfileSchema.safeParse({ legalName: "Junta de Acción Comunal Barrio Usme Centro", locality: "Usme", verificationStatus: "verificado", verificationSourceUrl: "soporte-local" });
    expect(result.success).toBe(false);
  });

  it("impide confirmar la ficha cuando faltan NIT, dirección o evidencia", () => {
    const result = institutionalProfileSchema.safeParse({
      legalName: "Junta de Acción Comunal Barrio Usme Centro",
      locality: "Usme",
      verificationStatus: "verificado",
      verificationSourceUrl: null,
      nit: null,
      officialAddress: null,
    });
    expect(result.success).toBe(false);
  });

  it("valida horario y monto de reserva", () => {
    expect(reservationSchema.safeParse({ eventName: "Reunión de comité", startsAt: "2026-08-24T14:00:00Z", endsAt: "2026-08-24T16:00:00Z", applicantType: "afiliado", amount: "25000.00" }).success).toBe(true);
    expect(reservationSchema.safeParse({ eventName: "Reunión de comité", startsAt: "2026-08-24T16:00:00Z", endsAt: "2026-08-24T14:00:00Z", applicantType: "afiliado", amount: "25.000" }).success).toBe(false);
  });

  it("valida montos financieros y limita el rol de tesorería", () => {
    expect(financialMovementSchema.safeParse({ movementType: "egreso", category: "Servicios", source: "Aportes comunitarios", description: "Pago de energía", amount: "125000", occurredAt: "2026-08-01T00:00:00Z" }).success).toBe(true);
    expect(canAccessJacRole("user", "tesorero_fiscal", ["tesorero_fiscal", "directiva"])).toBe(true);
    expect(canAccessJacRole("user", "afiliado", ["tesorero_fiscal"])).toBe(false);
    expect(canAccessJacRole("admin", "afiliado", ["tesorero_fiscal"])).toBe(true);
  });
});
