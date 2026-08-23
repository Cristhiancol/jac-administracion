import { describe, expect, it } from "vitest";
import { calculateFinancialBalance, isObligationOverdue, isValidNitFormat } from "./jac-calculations";

describe("cálculos financieros y legales de la JAC", () => {
  it("calcula el balance como ingresos menos egresos", () => {
    expect(calculateFinancialBalance(1250000, 435500)).toBe(814500);
  });

  it("reconoce formatos comunes de NIT y rechaza marcadores no verificables", () => {
    expect(isValidNitFormat("900000000-0")).toBe(true);
    expect(isValidNitFormat("900.000.000-0")).toBe(true);
    expect(isValidNitFormat("Ingresa tu NIT aquí")).toBe(false);
  });

  it("marca una obligación abierta cuyo plazo ya venció", () => {
    expect(isObligationOverdue(new Date("2026-01-15T00:00:00Z"), "pendiente", new Date("2026-02-01T00:00:00Z"))).toBe(true);
    expect(isObligationOverdue(new Date("2026-01-15T00:00:00Z"), "cumplida", new Date("2026-02-01T00:00:00Z"))).toBe(false);
  });
});
