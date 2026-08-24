// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const affiliate = {
  id: 1,
  code: "AF-999",
  fullName: "Afiliado de Prueba",
  cedula: "1018456789",
  address: null,
  phone: null,
  commissionName: "Deportes",
  status: "activo" as const,
  qrToken: "TOKEN-INSTITUCIONAL-7K2P",
  createdAt: new Date(),
  updatedAt: new Date(),
  attendedLastAssembly: true,
};

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, role: "admin", name: "Directiva" } }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    affiliates: {
      list: { useQuery: () => ({ data: [affiliate], isLoading: false, refetch: vi.fn() }) },
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

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/afiliados");
});

function expectInstitutionalCard(card: HTMLElement) {
  expect(within(card).getByText("Carnet digital")).toBeVisible();
  expect(within(card).getByText("Afiliado de Prueba")).toBeVisible();
  expect(
    within(card).getByRole("img", { name: /Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad/i }),
  ).toHaveAttribute("src", "/manus-storage/logo_jac_bellavista_colores_oficiales_112ab20c.webp");
  expect(within(card).getByTestId("affiliate-card-local-qr")).toHaveAttribute(
    "data-credential-source",
    "institutional-token",
  );
}

describe("carnet QR de Afiliados", () => {
  it("abre el carnet administrativo con QR local basado en token institucional", () => {
    render(<Affiliates />);

    fireEvent.click(screen.getByTitle("Generar QR Carnet"));

    expectInstitutionalCard(screen.getByTestId("affiliate-qr-card"));
  });

  it("abre el carnet desde el parámetro administrativo", () => {
    window.history.replaceState({}, "", "/afiliados?carnet=1018456789");
    render(<Affiliates />);

    expectInstitutionalCard(screen.getByTestId("affiliate-qr-card"));
  });
});
