// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const affiliate = {
  id: 1,
  code: "AF-1991",
  fullName: "María Bellavista",
  cedula: "123456789",
  address: null,
  phone: null,
  commissionName: "Deportes",
  status: "activo" as const,
  qrToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  attendedLastAssembly: false,
};

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", name: "Directiva" } }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    affiliates: {
      list: { useQuery: () => ({ data: [affiliate], refetch: vi.fn(), isLoading: false }) },
      create: { useMutation: () => ({ mutate: vi.fn() }) },
      bulkImport: { useMutation: () => ({ mutate: vi.fn() }) },
      remove: { useMutation: () => ({ mutate: vi.fn() }) },
    },
  },
}));

vi.mock("@/components/jac/JacShell", () => ({
  JacShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

import Affiliates from "./Affiliates";

describe("interacción de carnet QR de afiliados", () => {
  it("abre el overlay real y muestra el emblema oficial actualizado", () => {
    render(<Affiliates />);

    fireEvent.click(screen.getByTitle("Generar QR Carnet"));

    const card = screen.getByTestId("affiliate-qr-card");
    expect(within(card).getByText("Carnet digital")).toBeVisible();
    expect(within(card).getByText("María Bellavista")).toBeVisible();
    expect(
      within(card).getByRole("img", { name: /Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad/i }),
    ).toHaveAttribute("src", "/manus-storage/logo_jac_bellavista_colores_oficiales_112ab20c.webp");
    expect(within(card).getByRole("img", { name: /Código QR del carnet digital de María Bellavista/i })).toBeVisible();
  });

  it("abre el carnet oficial cuando la cédula conocida llega en el parámetro administrativo", () => {
    window.history.replaceState({}, "", "/afiliados?carnet=123456789");
    render(<Affiliates />);

    const card = screen.getAllByTestId("affiliate-qr-card").at(-1)!;
    expect(within(card).getByText("María Bellavista")).toBeVisible();
    expect(
      within(card).getByRole("img", { name: /Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad/i }),
    ).toHaveAttribute("src", "/manus-storage/logo_jac_bellavista_colores_oficiales_112ab20c.webp");
    expect(within(card).getByRole("img", { name: /Código QR del carnet digital de María Bellavista/i })).toBeVisible();
    window.history.replaceState({}, "", "/");
  });
});
