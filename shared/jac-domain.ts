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

export const AFFILIATE_STATUSES = ["activo", "inactivo", "suspendido"] as const;
export type AffiliateStatus = (typeof AFFILIATE_STATUSES)[number];

export const ASSEMBLY_TYPES = ["ordinaria", "extraordinaria", "comite"] as const;
export type AssemblyType = (typeof ASSEMBLY_TYPES)[number];

export const ASSEMBLY_STATUSES = ["programada", "en_curso", "finalizada", "cancelada"] as const;
export type AssemblyStatus = (typeof ASSEMBLY_STATUSES)[number];

export const CHAMPIONSHIP_TYPES = ["campeonato", "copa", "torneo_relampago"] as const;
export type ChampionshipType = (typeof CHAMPIONSHIP_TYPES)[number];

export const CHAMPIONSHIP_STATUSES = ["inscripcion", "en_curso", "finalizado", "cancelado"] as const;
export type ChampionshipStatus = (typeof CHAMPIONSHIP_STATUSES)[number];

export const CAMPAIGN_TYPES = ["ambiental", "salud", "cultural", "educativa", "deportiva", "otra"] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const CAMPAIGN_STATUSES = ["planeada", "activa", "completada", "cancelada"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CHECKIN_METHODS = ["qr_scan", "cedula_manual", "lista"] as const;
export type CheckInMethod = (typeof CHECKIN_METHODS)[number];

