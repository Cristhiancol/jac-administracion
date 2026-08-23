import { MapPin } from "lucide-react";

import React from "react";

const USME_CENTER = "4.4772,-74.1273";
const OSM_EMBED_URL = "https://www.openstreetmap.org/export/embed.html?bbox=-74.155%2C4.455%2C-74.099%2C4.499&layer=mapnik&marker=4.4772%2C-74.1273";

export function InstitutionalMap({ address }: { address?: string | null }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-[0_20px_50px_-35px_rgba(6,78,59,.45)]">
      <div className="flex items-start gap-3 border-b border-emerald-950/8 p-4">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700"><MapPin className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-bold text-emerald-950">Ubicación institucional</p>
          <p className="mt-0.5 text-xs leading-5 text-emerald-950/60">{address || "Centro provisional de la localidad de Usme, Bogotá D.C."}</p>
        </div>
      </div>
      <div className="relative h-[310px] bg-emerald-50">
        <iframe title={`Mapa de ubicación provisional de Usme, coordenadas ${USME_CENTER}`} src={OSM_EMBED_URL} className="h-full w-full border-0" loading="lazy" />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 text-[11px] font-semibold text-emerald-950 shadow-sm backdrop-blur">
          Marcador provisional de Usme; validar dirección de sede.
        </div>
      </div>
    </div>
  );
}
