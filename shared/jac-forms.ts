import { z } from "zod";

export const institutionalProfileSchema = z
  .object({
    legalName: z.string().trim().min(5).max(255),
    nit: z.string().trim().max(20).nullable().optional(),
    officialAddress: z.string().trim().max(500).nullable().optional(),
    neighborhood: z.string().trim().max(160).nullable().optional(),
    locality: z.string().trim().min(2).max(120),
    latitude: z.string().trim().max(20).nullable().optional(),
    longitude: z.string().trim().max(20).nullable().optional(),
    verificationStatus: z.enum(["pendiente", "verificado", "observado"]),
    verificationSourceUrl: z.string().url().max(1000).nullable().optional(),
    verificationNotes: z.string().trim().max(2000).nullable().optional(),
  })
  .superRefine((profile, context) => {
    if (profile.verificationStatus !== "verificado") return;
    if (!profile.nit || !/^\d{1,3}(?:\.\d{3}){2,3}-\d$|^\d{9,10}-?\d?$/.test(profile.nit)) {
      context.addIssue({ code: "custom", path: ["nit"], message: "Se requiere un NIT verificable para confirmar la ficha." });
    }
    if (!profile.officialAddress || profile.officialAddress.trim().length < 6) {
      context.addIssue({ code: "custom", path: ["officialAddress"], message: "Se requiere la dirección oficial para confirmar la ficha." });
    }
    if (!profile.verificationSourceUrl) {
      context.addIssue({ code: "custom", path: ["verificationSourceUrl"], message: "Se requiere una URL de soporte para confirmar la ficha." });
    }
  });

export const reservationSchema = z
  .object({
    eventName: z.string().trim().min(5).max(255),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    applicantType: z.enum(["afiliado", "vecino", "externo"]),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor monetario inválido"),
  })
  .refine(values => values.endsAt > values.startsAt, {
    message: "La hora final debe ser posterior a la inicial.",
    path: ["endsAt"],
  });

export const financialMovementSchema = z.object({
  movementType: z.enum(["ingreso", "egreso"]),
  category: z.string().trim().min(3).max(120),
  source: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(2000),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor monetario inválido"),
  occurredAt: z.coerce.date(),
  activityId: z.number().int().positive().nullable().optional(),
  supportUrl: z.string().url().max(1000).nullable().optional(),
});
