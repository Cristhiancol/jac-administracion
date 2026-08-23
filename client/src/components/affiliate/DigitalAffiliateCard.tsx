import React from "react";
import { JacLogo } from "@/components/JacLogo";

export type AffiliateCardIdentity = {
  code: string;
  fullName: string;
  cedula: string;
  status: "activo" | "inactivo" | "suspendido";
};

export function DigitalAffiliateCard({ affiliate }: { affiliate: AffiliateCardIdentity }) {
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
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          Código {affiliate.code} · Afiliado {affiliate.status}
        </p>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(affiliate.cedula)}`}
          alt={`Código QR del carnet digital de ${affiliate.fullName}`}
          className="mt-2 h-24 w-24 rounded-md bg-white p-1"
        />
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{affiliate.cedula}</span>
      </div>
    </div>
  );
}
