import { MapPin } from "lucide-react";

import React from "react";

const DEFAULT_COORDINATES = "4.5047526,-74.1068319";
const DEFAULT_MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!3m2!1ses!2sco!4v1787501743813!5m2!1ses!2sco!6m8!1m7!1s2mhgrDGW0URhOHVuphIrMQ!2m2!1d4.504752602911481!2d-74.1068319118239!3f262.74644463319964!4f1.2480677932996969!5f0.7820865974627469";

export function InstitutionalMap({ address, latitude, longitude, mapEmbedUrl }: { address?: string | null; latitude?: string | null; longitude?: string | null; mapEmbedUrl?: string | null }) {
  const coordinates = latitude && longitude ? `${latitude},${longitude}` : DEFAULT_COORDINATES;
  const source = mapEmbedUrl || DEFAULT_MAP_EMBED_URL;
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-[0_20px_50px_-35px_rgba(6,78,59,.45)]">
      <div className="flex items-start gap-3 border-b border-emerald-950/8 p-4">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700"><MapPin className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-bold text-emerald-950">Ubicación institucional</p>
          <p className="mt-0.5 text-xs leading-5 text-emerald-950/60">{address || "Carrera 54D # 167B-11, Bogotá, Colombia"}</p>
        </div>
      </div>
      <div className="relative h-[310px] bg-emerald-50">
        <iframe title={`Mapa de sede institucional confirmada, coordenadas ${coordinates}`} src={source} className="h-full w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 text-[11px] font-semibold text-emerald-950 shadow-sm backdrop-blur">
          Sede confirmada por la Directiva · Coordenadas {coordinates}
        </div>
      </div>
    </div>
  );
}
