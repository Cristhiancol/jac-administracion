// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstitutionalMap } from "./InstitutionalMap";
import { JacShell } from "./JacShell";
import { StatusBadge } from "./StatusBadge";

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, user: { name: "Cristhian" }, loading: false, logout: vi.fn() }) }));
vi.mock("@/contexts/ThemeContext", () => ({ useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }) }));

describe("componentes de interfaz JAC", () => {
  it("presenta un estado verificable y legible", () => {
    render(<StatusBadge status="verificado" />);
    expect(screen.getByText("verificado")).toBeVisible();
    expect(screen.getByText("verificado").className).toContain("bg-emerald-100");
  });

  it("expone el mapa de sede confirmada con título accesible y coordenadas visibles", () => {
    render(<InstitutionalMap address={null} />);
    expect(screen.getByTitle(/Mapa de sede institucional confirmada/i)).toBeVisible();
    expect(screen.getByText(/Sede confirmada por la Directiva/i)).toBeVisible();
  });

  it("expone la navegación principal del panel para los módulos comunitarios", () => {
    render(<JacShell eyebrow="Prueba" title="Panel" description="Descripción de prueba"><p>Contenido</p></JacShell>);
    expect(screen.getByRole("img", { name: "Emblema JAC Bellavista 1991" })).toBeVisible();
    expect(screen.getAllByText(/Todos Somos Comunidad/i)[0]).toBeVisible();
    const nav = screen.getByLabelText("Navegación principal");
    expect(nav).toHaveTextContent("Plan comunal");
    expect(nav).toHaveTextContent("Obligaciones");
    expect(nav).toHaveTextContent("Finanzas");
    expect(nav).toHaveTextContent("Noticias");
  });
});
