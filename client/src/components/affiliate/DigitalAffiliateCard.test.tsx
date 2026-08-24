// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildAffiliateQrPayload } from "@/lib/affiliate-qr";
import { DigitalAffiliateCard } from "./DigitalAffiliateCard";

describe("carnet QR de afiliado", () => {
  it("muestra el logo oficial, identidad del afiliado y código QR", () => {
    render(
      <DigitalAffiliateCard
        affiliate={{
          code: "AF-1991",
          fullName: "María Bellavista",
          cedula: "123456789",
          qrToken: "TOKEN-INSTITUCIONAL-1991",
          status: "activo",
        }}
      />,
    );

    const card = screen.getByTestId("affiliate-qr-card");
    expect(within(card).getByText("Carnet digital")).toBeVisible();
    expect(within(card).getByText("María Bellavista")).toBeVisible();
    expect(within(card).getByText(/Código AF-1991 · Afiliado activo/i)).toBeVisible();

    expect(
      within(card).getByRole("img", { name: /Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad/i }),
    ).toHaveAttribute("src", "/manus-storage/logo_jac_bellavista_colores_oficiales_112ab20c.webp");
    expect(within(card).getByTestId("affiliate-card-local-qr")).toHaveAttribute(
      "data-credential-source",
      "institutional-token",
    );
    expect(within(card).queryByRole("img", { name: /Código QR del carnet digital/i })).toBeNull();

    const payload = buildAffiliateQrPayload({ code: "AF-1991", qrToken: "TOKEN-INSTITUCIONAL-1991" });
    expect(payload).toBe("JAC-BV91-TOKEN-INSTITUCIONAL-1991");
    expect(payload).not.toContain("123456789");
  });
});
