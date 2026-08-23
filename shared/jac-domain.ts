export const JAC_ROLES = [
  "directiva",
  "coordinador_comite",
  "tesorero_fiscal",
  "secretario",
  "afiliado",
] as const;

export type JacRole = (typeof JAC_ROLES)[number];

export const INSTITUTIONAL_VERIFICATION_STATUSES = [
  "pendiente",
  "verificado",
  "observado",
] as const;

export type InstitutionalVerificationStatus =
  (typeof INSTITUTIONAL_VERIFICATION_STATUSES)[number];

export const OBLIGATION_STATUSES = [
  "pendiente",
  "en_proceso",
  "cumplida",
  "vencida",
] as const;

export type ObligationStatus = (typeof OBLIGATION_STATUSES)[number];

export const FINANCIAL_MOVEMENT_TYPES = ["ingreso", "egreso"] as const;
export type FinancialMovementType = (typeof FINANCIAL_MOVEMENT_TYPES)[number];
