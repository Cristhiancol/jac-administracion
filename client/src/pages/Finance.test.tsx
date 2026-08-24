// @vitest-environment jsdom
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Finance from "./Finance";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

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
      bulkImport: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      confirmReservationIncome: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      record: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      setBudget: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
    reservations: {
      snapshot: {
        useQuery: () => ({ data: { reservations: [] }, isLoading: false, isError: false }),
      },
    },
    workPlan: {
      snapshot: {
        useQuery: () => ({ data: { activities: [] }, isLoading: false, isError: false }),
      },
    },
    useUtils: () => ({
      finance: { snapshot: { invalidate: vi.fn() } },
      reservations: { snapshot: { invalidate: vi.fn() } },
    }),
  },
}));

describe("Reporte consolidado de Finanzas", () => {
  it("muestra el total acumulado 2025–2026 de $9.739.678", () => {
    render(<Finance />);

    fireEvent.click(screen.getByRole("tab", { name: /Consolidado por Categoría/i }));

    expect(screen.getAllByText("Total Acumulado")[0]).toBeVisible();
    expect(screen.getAllByText(/9\.739\.678/)[0]).toBeVisible();
    expect(screen.getByText(/Consolidado de Gastos por Categoría \(2025 – 2026\)/)).toBeVisible();
  });
});
