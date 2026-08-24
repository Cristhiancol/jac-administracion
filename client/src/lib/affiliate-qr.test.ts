import { describe, expect, it } from "vitest";
import { buildAffiliateQrPayload } from "./affiliate-qr";

describe("buildAffiliateQrPayload", () => {
  it("usa el token institucional y no incorpora la cédula del afiliado", () => {
    const cedula = "1018456789";
    const payload = buildAffiliateQrPayload({
      code: "AF-999",
      qrToken: "JAC-TOKEN-PRIVADO-7K2P",
    });

    expect(payload).toBe("JAC-BV91-JAC-TOKEN-PRIVADO-7K2P");
    expect(payload).not.toContain(cedula);
  });

  it("usa el código institucional cuando el token aún no está disponible", () => {
    expect(buildAffiliateQrPayload({ code: "AF-999", qrToken: null })).toBe("JAC-BV91-AF-999");
  });
});
