// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Finance from "./Finance";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/components/jac/JacShell", () => ({
  JacShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/jac/JacLoadingState", () => ({
  JacLoadingState: () => <div>Cargando</div>,
}));

vi.mock("@/components/jac/SupportFileInput", () => ({
  SupportFileInput: () => <div>Soporte</div>,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    finance: {
      snapshot: {
        useQuery: () => ({ data: { movements: [], budgets: [] }, isLoading: false, isError: false }),
      },
      record: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      setBudget: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
    workPlan: {
      snapshot: {
        useQuery: () => ({ data: { activities: [] }, isLoading: false, isError: false }),
      },
    },
    useUtils: () => ({
      finance: { snapshot: { invalidate: vi.fn() } },
    }),
  },
}));

describe("Reporte consolidado de Finanzas", () => {
  it("muestra el total acumulado 2025–2026 de $9.739.678", () => {
    render(<Finance />);

    expect(screen.getAllByText("Total Acumulado")[0]).toBeVisible();
    expect(screen.getAllByText(/9\.739\.678/)[0]).toBeVisible();
    expect(screen.getByText(/Reporte Consolidado \(2025 - 2026\)/)).toBeVisible();
  });
});
