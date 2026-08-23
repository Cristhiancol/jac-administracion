import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Obligation = { id: number; status: "pendiente" | "en_proceso" | "cumplida" | "vencida"; supportUrl: string | null };
export function ObligationControl({ obligation }: { obligation: Obligation }) {
  const [status, setStatus] = useState<Obligation["status"]>(obligation.status);
  const [supportUrl, setSupportUrl] = useState(obligation.supportUrl ?? "");
  const utils = trpc.useUtils();
  const update = trpc.obligations.update.useMutation({ onSuccess: async () => { await utils.obligations.snapshot.invalidate(); toast.success("Cumplimiento de obligación actualizado."); }, onError: error => toast.error(error.message) });
  return <div className="mt-3 grid gap-2 rounded-xl bg-emerald-50/70 p-3 sm:grid-cols-[1fr_1.6fr_auto]"><select value={status} onChange={event => setStatus(event.target.value as Obligation["status"])} aria-label="Estado de cumplimiento" className="h-9 rounded-lg border border-emerald-900/15 bg-white px-2 text-xs"><option value="pendiente">Pendiente</option><option value="en_proceso">En proceso</option><option value="cumplida">Cumplida</option><option value="vencida">Vencida</option></select><Input value={supportUrl} onChange={event => setSupportUrl(event.target.value)} placeholder="URL de soporte (opcional)" className="h-9 rounded-lg border-emerald-900/15 bg-white text-xs" /><Button size="sm" disabled={update.isPending} onClick={() => update.mutate({ id: obligation.id, status, supportUrl: supportUrl || null })} className="h-9 rounded-lg bg-emerald-700 px-3 text-xs hover:bg-emerald-800"><Save className="mr-1 h-3.5 w-3.5" />Guardar</Button></div>;
}
