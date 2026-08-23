import { useAuth } from "@/_core/hooks/useAuth";
import { InstitutionalMap } from "@/components/jac/InstitutionalMap";
import { JacShell } from "@/components/jac/JacShell";
import { StatusBadge } from "@/components/jac/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BadgeInfo, CheckCircle2, FileCheck2, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FormState = { legalName: string; nit: string; officialAddress: string; neighborhood: string; locality: string; latitude: string; longitude: string; verificationStatus: "pendiente" | "verificado" | "observado"; verificationSourceUrl: string; verificationNotes: string };
const defaultForm: FormState = { legalName: "Junta de Acción Comunal Barrio Usme Centro / Localidad de Usme", nit: "", officialAddress: "", neighborhood: "", locality: "Usme", latitude: "4.4772", longitude: "-74.1273", verificationStatus: "pendiente", verificationSourceUrl: "", verificationNotes: "" };

export default function InstitutionalProfile() {
  const { isAuthenticated, user } = useAuth();
  const profileQuery = trpc.institutional.get.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const [form, setForm] = useState<FormState>(defaultForm);
  const save = trpc.institutional.save.useMutation({ onSuccess: async () => { await utils.institutional.get.invalidate(); toast.success("Ficha institucional actualizada."); }, onError: error => toast.error(error.message) });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setForm({ legalName: profile.legalName, nit: profile.nit ?? "", officialAddress: profile.officialAddress ?? "", neighborhood: profile.neighborhood ?? "", locality: profile.locality, latitude: profile.latitude ?? "4.4772", longitude: profile.longitude ?? "-74.1273", verificationStatus: profile.verificationStatus, verificationSourceUrl: profile.verificationSourceUrl ?? "", verificationNotes: profile.verificationNotes ?? "" });
  }, [profileQuery.data]);

  const update = (key: keyof FormState, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); save.mutate({ ...form, nit: form.nit || null, officialAddress: form.officialAddress || null, neighborhood: form.neighborhood || null, latitude: form.latitude || null, longitude: form.longitude || null, verificationSourceUrl: form.verificationSourceUrl || null, verificationNotes: form.verificationNotes || null }); };

  return <JacShell eyebrow="Gobierno y trazabilidad" title="Ficha institucional de la JAC" description="Administra el nombre legal, NIT, sede y evidencia de verificación. Los campos sin soporte se conservan como pendientes de validación.">
    <div className="grid gap-6 xl:grid-cols-[1fr_.95fr]">
      <Card className="border-emerald-950/8 bg-white shadow-[0_20px_50px_-35px_rgba(6,78,59,.45)]"><CardContent className="p-6 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-2xl font-bold text-emerald-950">Datos de identificación</h2><p className="mt-1 text-sm leading-6 text-emerald-950/55">La información pública solo debe confirmarse tras validar el soporte oficial.</p></div><StatusBadge status={form.verificationStatus} /></div><form onSubmit={submit} className="mt-7 grid gap-5"><Field label="Nombre jurídico" value={form.legalName} onChange={value => update("legalName", value)} required /><div className="grid gap-5 sm:grid-cols-2"><Field label="NIT" value={form.nit} onChange={value => update("nit", value)} placeholder="Ej. 900.000.000-0" /><Field label="Barrio o sector" value={form.neighborhood} onChange={value => update("neighborhood", value)} placeholder="Pendiente de registrar" /></div><Field label="Dirección oficial de la sede" value={form.officialAddress} onChange={value => update("officialAddress", value)} placeholder="Pendiente de registrar y verificar" /><div className="grid gap-5 sm:grid-cols-2"><Field label="Localidad" value={form.locality} onChange={value => update("locality", value)} required /><label className="grid gap-2 text-sm font-bold text-emerald-950">Estado de validación<select value={form.verificationStatus} onChange={event => update("verificationStatus", event.target.value)} className="h-10 rounded-xl border border-emerald-950/15 bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600"><option value="pendiente">Pendiente de verificación</option><option value="observado">Observado</option><option value="verificado">Verificado</option></select></label></div><Field label="URL del soporte de verificación" value={form.verificationSourceUrl} onChange={value => update("verificationSourceUrl", value)} placeholder="https://…" /><label className="grid gap-2 text-sm font-bold text-emerald-950">Notas de validación<Textarea value={form.verificationNotes} onChange={event => update("verificationNotes", event.target.value)} placeholder="Documento, fecha y responsable de revisión." className="min-h-24 rounded-xl border-emerald-950/15" /></label>{isAuthenticated ? <Button type="submit" disabled={save.isPending} className="mt-1 w-full rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"><Save className="mr-2 h-4 w-4" />{save.isPending ? "Guardando…" : "Guardar ficha institucional"}</Button> : <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><BadgeInfo className="mr-2 inline h-4 w-4" />Inicia sesión con perfil autorizado para modificar la ficha institucional.</div>}</form></CardContent></Card>
      <div className="grid content-start gap-6"><InstitutionalMap address={form.officialAddress} /><Card className="border-emerald-950/8 bg-emerald-50/70"><CardContent className="p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-800"><ShieldCheck className="h-5 w-5" /></span><div><p className="font-bold text-emerald-950">Control de publicación</p><p className="mt-1 text-sm leading-6 text-emerald-950/65">El panel conserva el estado pendiente hasta que la Directiva adjunte soporte oficial para el NIT y la dirección. El centro del mapa representa a Usme de forma provisional.</p></div></div><div className="mt-5 flex gap-2 border-t border-emerald-900/10 pt-4 text-xs font-semibold text-emerald-800"><FileCheck2 className="h-4 w-4" />Usuario actual: {user?.name || "sin sesión"}</div></CardContent></Card></div>
    </div>
  </JacShell>;
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) { return <label className="grid gap-2 text-sm font-bold text-emerald-950"><Label>{label}</Label><Input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} required={required} className="h-10 rounded-xl border-emerald-950/15" /></label>; }
