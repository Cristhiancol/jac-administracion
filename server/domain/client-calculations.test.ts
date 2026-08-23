import { describe, expect, it } from "vitest";
import { calculateBalance, calculateProgress, getBudgetExecution } from "../../client/src/lib/jac-calculations";

describe("indicadores del panel JAC", () => {
  it("calcula y limita el avance de actividades entre 0 y 100", () => {
    expect(calculateProgress(3, 4)).toBe(75);
    expect(calculateProgress(12, 4)).toBe(100);
    expect(calculateProgress(1, 0)).toBe(0);
  });

  it("calcula balance y ejecución de presupuesto", () => {
    expect(calculateBalance(100000, 35500)).toBe(64500);
    expect(getBudgetExecution(250000, 1000000)).toBe(25);
    expect(getBudgetExecution(250000, 0)).toBe(0);
  });
});
