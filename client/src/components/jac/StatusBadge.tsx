import { CheckCircle2, Clock3, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "pendiente" | "verificado" | "observado" | "cumplida" | "en_proceso" | "vencida";

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pendiente: "bg-amber-100 text-amber-900",
    verificado: "bg-emerald-100 text-emerald-900",
    observado: "bg-rose-100 text-rose-900",
    cumplida: "bg-emerald-100 text-emerald-900",
    en_proceso: "bg-sky-100 text-sky-900",
    vencida: "bg-rose-100 text-rose-900",
  };
  const Icon = status === "verificado" || status === "cumplida" ? CheckCircle2 : status === "observado" || status === "vencida" ? TriangleAlert : Clock3;
  const label = status.replaceAll("_", " ");

  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", styles[status])}><Icon className="h-3.5 w-3.5" />{label}</span>;
}
