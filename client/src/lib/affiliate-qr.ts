export type AffiliateQrIdentity = {
  code: string;
  qrToken: string | null;
};

/**
 * Construye el identificador visual de la credencial sin incorporar la cédula.
 * El token QR se emite y almacena como identificador institucional independiente.
 */
export function buildAffiliateQrPayload({ code, qrToken }: AffiliateQrIdentity) {
  return `JAC-BV91-${qrToken ?? code}`;
}
