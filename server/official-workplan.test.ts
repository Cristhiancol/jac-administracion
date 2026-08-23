import { describe, expect, it } from "vitest";
import { OFFICIAL_WORK_PLAN_2026_2030 } from "@shared/official-workplan-2026-2030";

describe("Matriz estratégica oficial 2026–2030", () => {
  it("contiene los ocho ejes estratégicos aprobados para la vigencia 2026–2030", () => {
    expect(OFFICIAL_WORK_PLAN_2026_2030).toHaveLength(8);
    expect(OFFICIAL_WORK_PLAN_2026_2030.map((axis) => axis.eje)).toEqual([
      "Organización y legalidad",
      "Salón comunal",
      "Seguridad",
      "Residuos",
      "Tecnología",
      "Tesorería y control",
      "Convivencia y participación",
      "Gestión institucional",
    ]);
  });

  it("asigna actividades, resultados esperados y comisiones a cada eje", () => {
    OFFICIAL_WORK_PLAN_2026_2030.forEach((axis) => {
      expect(axis.actividades.length).toBeGreaterThan(0);
      expect(axis.resultadoEsperado.length).toBeGreaterThan(0);
      expect(axis.comisionSugerida.length).toBeGreaterThan(0);
    });
  });
});
