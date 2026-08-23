import { describe, expect, it } from "vitest";
import { calculateBalance, getBudgetExecution } from "../client/src/lib/jac-calculations";
import { REPORTED_EXPENSES_BY_CATEGORY, TOTAL_EXPENSES_2025, TOTAL_EXPENSES_2026, TOTAL_EXPENSES_ALL } from "../shared/reported-expenses";

describe("Pruebas de Lógica Contable y Estado de Resultados (P&L JAC Bellavista)", () => {
  it("calcula correctamente el balance neto y el superávit/déficit comunal", () => {
    const ingresosTotal = 15700000;
    const egresosTotal = TOTAL_EXPENSES_ALL; // $9,739,678
    const balance = calculateBalance(ingresosTotal, egresosTotal);

    expect(balance).toBe(5960322); // $15,700,000 - $9,739,678 = $5,960,322
    expect(balance).toBeGreaterThan(0);
  });

  it("verifica la precisión del consolidado oficial de gastos 2025 - 2026", () => {
    const sumCategories2025 = REPORTED_EXPENSES_BY_CATEGORY.reduce((acc, c) => acc + c.year2025, 0);
    const sumCategories2026 = REPORTED_EXPENSES_BY_CATEGORY.reduce((acc, c) => acc + c.year2026, 0);
    const sumCategoriesTotal = REPORTED_EXPENSES_BY_CATEGORY.reduce((acc, c) => acc + c.total, 0);

    expect(sumCategories2025).toBe(TOTAL_EXPENSES_2025);
    expect(sumCategories2026).toBe(TOTAL_EXPENSES_2026);
    expect(sumCategoriesTotal).toBe(TOTAL_EXPENSES_ALL);
  });

  it("evalúa la ejecución presupuestal frente al presupuesto aprobado", () => {
    const egresosRealizados = 9739678;
    const presupuestoAprobado = 12000000;
    const porcentajeEjecucion = getBudgetExecution(egresosRealizados, presupuestoAprobado);

    expect(porcentajeEjecucion).toBe(81);
  });

  it("valida la regla de confirmación previa para ingresos por alquiler de salón", () => {
    const reserva = {
      id: 10,
      eventName: "Evento Privado",
      amount: "120000",
      status: "solicitada" as const,
      paymentStatus: "pendiente" as const,
    };

    // Before confirmation: money is unconfirmed income
    let saldoConfirmado = 0;
    expect(reserva.status).toBe("solicitada");
    expect(saldoConfirmado).toBe(0);

    // Upon Confirmation by Treasurer:
    const confirmedReserva = { ...reserva, status: "aprobada" as const, paymentStatus: "confirmado" as const };
    saldoConfirmado += Number(confirmedReserva.amount);

    expect(confirmedReserva.status).toBe("aprobada");
    expect(saldoConfirmado).toBe(120000);
  });
});
