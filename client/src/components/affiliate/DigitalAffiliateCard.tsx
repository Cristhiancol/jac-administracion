import React from "react";
import { JacLogo } from "@/components/JacLogo";
import { buildAffiliateQrPayload } from "@/lib/affiliate-qr";

export type AffiliateCardIdentity = {
  code: string;
  fullName: string;
  cedula: string;
  qrToken: string | null;
  status: "activo" | "inactivo" | "suspendido";
};

function LocalQrVisual({ data, source }: { data: string; source: "institutional-token" | "affiliate-code" }) {
  const cells = 11;
  const size = 100;
  const cellSize = size / cells;
  const hash = (text: string, seed: number) => {
    let value = seed;
    for (let i = 0; i < text.length; i++) value = ((value << 5) - value + text.charCodeAt(i)) | 0;
    return value;
  };

  return (
    <svg
      data-testid="affiliate-card-local-qr"
      data-credential-source={source}
      aria-label="Código QR local del carnet"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mt-2 rounded-md bg-white p-1"
    >
      <rect width={size} height={size} fill="white" />
      {Array.from({ length: cells }, (_, row) =>
        Array.from({ length: cells }, (_, col) => {
          const topLeft = row < 3 && col < 3;
          const topRight = row < 3 && col >= cells - 3;
          const bottomLeft = row >= cells - 3 && col < 3;
          const finder = topLeft || topRight || bottomLeft;
          const finderBorder = finder && (
            row === 0 || row === 2 || col === 0 || col === 2 || row === cells - 1 || row === cells - 3 || col === cells - 1 || col === cells - 3
          );
          const finderCenter = (row === 1 && col === 1) || (row === 1 && col === cells - 2) || (row === cells - 2 && col === 1);
          const filled = finderBorder || finderCenter || (!finder && (hash(data, row * cells + col) & 1) === 1);
          return filled ? <rect key={`${row}-${col}`} x={col * cellSize} y={row * cellSize} width={cellSize} height={cellSize} fill="#0F172A" rx={1} /> : null;
        }),
      )}
    </svg>
  );
}

export function DigitalAffiliateCard({ affiliate }: { affiliate: AffiliateCardIdentity }) {
  const source = affiliate.qrToken ? "institutional-token" : "affiliate-code";
  const payload = buildAffiliateQrPayload({ code: affiliate.code, qrToken: affiliate.qrToken });

  return (
    <div
      data-testid="affiliate-qr-card"
      className="absolute right-8 z-10 mt-2 w-64 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl dark:border-blue-950 dark:bg-slate-950"
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#0F4C81] to-[#1B8A5A] px-3 py-2 text-white">
        <JacLogo variant="icon" size="sm" className="rounded-full bg-white/95 p-0.5" />
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Carnet digital</p>
          <p className="truncate text-xs font-semibold">JAC Bellavista 1991</p>
        </div>
      </div>
      <div className="flex flex-col items-center px-3 py-3 text-center">
        <p className="max-w-full truncate text-sm font-bold text-slate-900 dark:text-white">{affiliate.fullName}</p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Código {affiliate.code} · Afiliado {affiliate.status}</p>
        <LocalQrVisual data={payload} source={source} />
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Credencial institucional local</span>
      </div>
    </div>
  );
}
