// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DigitalAffiliateCard } from "./DigitalAffiliateCard";

describe("carnet QR de afiliado", () => {
  it("muestra el logo oficial, identidad del afiliado y código QR", () => {
    render(
      <DigitalAffiliateCard
        affiliate={{ code: "AF-1991", fullName: "María Bellavista", cedula: "123456789", status: "activo" }}
      />,
    );

    const card = screen.getByTestId("affiliate-qr-card");
    expect(within(card).getByText("Carnet digital")).toBeVisible();
    expect(within(card).getByText("María Bellavista")).toBeVisible();
    expect(within(card).getByText(/Código AF-1991 · Afiliado activo/i)).toBeVisible();

    expect(
      within(card).getByRole("img", { name: /Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad/i }),
    ).toHaveAttribute("src", "/manus-storage/logo_jac_bellavista_colores_oficiales_112ab20c.webp");
    expect(within(card).getByRole("img", { name: /Código QR del carnet digital de María Bellavista/i })).toHaveAttribute(
      "src",
      expect.stringContaining("data=123456789"),
    );
  });
});
