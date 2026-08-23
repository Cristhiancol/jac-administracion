import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ saveInstitutionalProfile: vi.fn().mockResolvedValue({ id: 1, verificationStatus: "verificado" }) }));
vi.mock("./db", async importOriginal => ({ ...(await importOriginal<typeof import("./db")>()), saveInstitutionalProfile: mocks.saveInstitutionalProfile }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context: TrpcContext = {
  user: { id: 31, openId: "directiva-institutional", email: "directiva@example.com", name: "Directiva", loginMethod: "manus", role: "user", jacRole: "directiva", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("integración de ficha institucional verificable", () => {
  it("persiste una ficha verificada solo con NIT, dirección y evidencia", async () => {
    const caller = appRouter.createCaller(context);
    await caller.institutional.save({ legalName: "Junta de Acción Comunal Barrio Usme Centro", nit: "900.000.000-0", officialAddress: "Calle 90 Sur # 3-20, Usme", neighborhood: "Usme Centro", locality: "Usme", latitude: "4.4772", longitude: "-74.1273", verificationStatus: "verificado", verificationSourceUrl: "https://ejemplo.gov.co/soporte", verificationNotes: "Documento de soporte validado por la Directiva." });
    expect(mocks.saveInstitutionalProfile).toHaveBeenCalledWith(expect.objectContaining({ verificationStatus: "verificado", verifiedByUserId: 31, nit: "900.000.000-0" }));
  });
});
