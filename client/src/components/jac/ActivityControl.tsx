import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Activity = { id: number; progress: number; status: "pendiente" | "en_proceso" | "completada" | "bloqueada"; evidenceUrl: string | null };

export function ActivityControl({ activity }: { activity: Activity }) {
  const [progress, setProgress] = useState(String(activity.progress));
  const [status, setStatus] = useState<Activity["status"]>(activity.status);
  const [evidenceUrl, setEvidenceUrl] = useState(activity.evidenceUrl ?? "");
  const utils = trpc.useUtils();
  const update = trpc.workPlan.updateActivity.useMutation({ onSuccess: async () => { await utils.workPlan.snapshot.invalidate(); toast.success("Seguimiento de actividad actualizado."); }, onError: error => toast.error(error.message) });

  return <div className="mt-4 grid gap-2 rounded-xl bg-emerald-50/70 p-3 sm:grid-cols-[90px_1fr_1.2fr_auto]"><Input value={progress} onChange={event => setProgress(event.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-label="Porcentaje de avance" placeholder="Avance" className="h-9 rounded-lg border-emerald-900/15 bg-white text-xs" /><select value={status} onChange={event => setStatus(event.target.value as Activity["status"])} aria-label="Estado de actividad" className="h-9 rounded-lg border border-emerald-900/15 bg-white px-2 text-xs"><option value="pendiente">Pendiente</option><option value="en_proceso">En proceso</option><option value="completada">Completada</option><option value="bloqueada">Bloqueada</option></select><Input value={evidenceUrl} onChange={event => setEvidenceUrl(event.target.value)} placeholder="URL de evidencia (opcional)" className="h-9 rounded-lg border-emerald-900/15 bg-white text-xs" /><Button size="sm" disabled={update.isPending} onClick={() => update.mutate({ id: activity.id, progress: Number(progress || 0), status, evidenceUrl: evidenceUrl || null })} className="h-9 rounded-lg bg-emerald-700 px-3 text-xs hover:bg-emerald-800"><Save className="mr-1 h-3.5 w-3.5" />Guardar</Button></div>;
}
