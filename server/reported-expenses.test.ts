import { describe, expect, it } from "vitest";
import {
  REPORTED_EXPENSES_BY_CATEGORY,
  REPORTED_EXPENSES_BY_MONTH,
  TOTAL_EXPENSES_2025,
  TOTAL_EXPENSES_2026,
  TOTAL_EXPENSES_ALL,
} from "@shared/reported-expenses";

describe("Validación Matemática del Reporte de Gastos Consolidados (2025 - 2026)", () => {
  it("verifica que la suma de gastos por categoría coincida exactamente con los totales del reporte", () => {
    const sum2025 = REPORTED_EXPENSES_BY_CATEGORY.reduce((acc, curr) => acc + curr.year2025, 0);
    const sum2026 = REPORTED_EXPENSES_BY_CATEGORY.reduce((acc, curr) => acc + curr.year2026, 0);
    const sumTotal = REPORTED_EXPENSES_BY_CATEGORY.reduce((acc, curr) => acc + curr.total, 0);

    expect(sum2025).toBe(2949632);
    expect(sum2026).toBe(6790046);
    expect(sumTotal).toBe(9739678);
    expect(sum2025 + sum2026).toBe(sumTotal);
  });

  it("verifica que la suma de gastos por mes reportado coincida exactamente con los totales del reporte", () => {
    const sum2025 = REPORTED_EXPENSES_BY_MONTH.reduce((acc, curr) => acc + curr.year2025, 0);
    const sum2026 = REPORTED_EXPENSES_BY_MONTH.reduce((acc, curr) => acc + curr.year2026, 0);
    const sumTotal = REPORTED_EXPENSES_BY_MONTH.reduce((acc, curr) => acc + curr.total, 0);

    expect(sum2025).toBe(2949632);
    expect(sum2026).toBe(6790046);
    expect(sumTotal).toBe(9739678);
  });

  it("verifica la integridad de rubros clave por categoría", () => {
    const luz = REPORTED_EXPENSES_BY_CATEGORY.find((c) => c.category === "Luz");
    expect(luz).toBeDefined();
    expect(luz?.year2025).toBe(598550);
    expect(luz?.year2026).toBe(1013630);
    expect(luz?.total).toBe(1612180);
    expect(luz?.percentage).toBe(16.6);

    const alimentacion = REPORTED_EXPENSES_BY_CATEGORY.find((c) => c.category === "Alimentación y eventos");
    expect(alimentacion).toBeDefined();
    expect(alimentacion?.year2025).toBe(1643250);
    expect(alimentacion?.year2026).toBe(1809700);
    expect(alimentacion?.total).toBe(3452950);
    expect(alimentacion?.percentage).toBe(35.5);

    const tramites = REPORTED_EXPENSES_BY_CATEGORY.find((c) => c.category === "Documentación y trámites");
    expect(tramites).toBeDefined();
    expect(tramites?.year2025).toBe(0);
    expect(tramites?.year2026).toBe(1214000);
    expect(tramites?.total).toBe(1214000);
    expect(tramites?.percentage).toBe(12.5);
  });

  it("verifica la distribución de meses y rubros sin mes reportado", () => {
    const sinMes = REPORTED_EXPENSES_BY_MONTH.find((m) => m.month === "Sin mes reportado");
    expect(sinMes).toBeDefined();
    expect(sinMes?.year2025).toBe(111722);
    expect(sinMes?.year2026).toBe(4903920);
    expect(sinMes?.total).toBe(5015642);

    const agosto = REPORTED_EXPENSES_BY_MONTH.find((m) => m.month === "Agosto");
    expect(agosto).toBeDefined();
    expect(agosto?.year2025).toBe(124290);
    expect(agosto?.year2026).toBe(275430);
    expect(agosto?.total).toBe(399720);
  });

  it("verifica los totales constantes globales del sistema", () => {
    expect(TOTAL_EXPENSES_2025).toBe(2949632);
    expect(TOTAL_EXPENSES_2026).toBe(6790046);
    expect(TOTAL_EXPENSES_ALL).toBe(9739678);
  });
});
