import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

const ALLOWED_CONTENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export const filesRouter = router({
  uploadSupport: protectedProcedure
    .input(z.object({ fileName: z.string().trim().min(1).max(180), contentType: z.enum(ALLOWED_CONTENT_TYPES), base64: z.string().min(4).max(7_000_000) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const bytes = Buffer.from(input.base64, "base64");
      if (!bytes.length || bytes.length > 5_000_000) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "El soporte debe ser menor o igual a 5 MB." });
      const fileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      return storagePut(`jac-supports/${ctx.user.id}/${fileName}`, bytes, input.contentType);
    }),
});
