// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("carnet QR de Afiliados", () => {
  it("abre el overlay administrativo y genera un SVG local basado en token institucional", () => {
    render(<Affiliates />);

    fireEvent.click(screen.getByTitle("Generar QR Carnet"));

    const overlay = screen.getByTestId("affiliate-qr-overlay");
    const qr = screen.getByTestId("local-qr-code");
    expect(qr.getAttribute("data-credential-source")).toBe("institutional-token");
    expect(overlay.textContent).toContain("QR generado localmente");
    expect(overlay.textContent).toContain("1018456789");
  });

  it("abre el carnet desde el parámetro administrativo", () => {
    window.history.replaceState({}, "", "/afiliados?carnet=1018456789");
    render(<Affiliates />);

    const overlay = screen.getByTestId("affiliate-qr-overlay");
    const qr = screen.getByTestId("local-qr-code");
    expect(qr.getAttribute("data-credential-source")).toBe("institutional-token");
    expect(overlay.textContent).toContain("QR generado localmente");
  });
});
