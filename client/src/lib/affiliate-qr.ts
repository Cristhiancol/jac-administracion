export type AffiliateQrIdentity = {
  code: string;
  qrToken: string | null;
};

/** Construye una credencial QR institucional sin incorporar la cédula del afiliado. */
export function buildAffiliateQrPayload({ code, qrToken }: AffiliateQrIdentity) {
  return `JAC-BV91-${qrToken ?? code}`;
}
