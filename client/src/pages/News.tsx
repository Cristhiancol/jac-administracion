import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { JacLoadingState } from "@/components/jac/JacLoadingState";
import { StatusBadge } from "@/components/jac/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Newspaper, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const sourceUrl = "https://usme.gobiernobogota.gov.co/";

export default function News() {
  const { isAuthenticated, user } = useAuth();
  const sources = trpc.news.sources.useQuery(undefined, { enabled: isAuthenticated });
  const snapshot = trpc.news.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const synchronize = trpc.news.synchronizeNow.useMutation({
    onSuccess: async result => {
      await Promise.all([utils.news.snapshot.invalidate(), utils.news.sources.invalidate()]);
      toast.success(`${result.imported} comunicados sincronizados desde la fuente oficial.`);
    },
    onError: error => toast.error(error.message),
  });
  const items = snapshot.data?.news ?? [];
  if (snapshot.isLoading || sources.isLoading) return <JacShell eyebrow="Información institucional" title="Noticias y comunicados de Usme" description="Cargando fuente y comunicados institucionales."><JacLoadingState label="Cargando noticias institucionales" /></JacShell>;
  if (snapshot.error || sources.error) return <JacShell eyebrow="Información institucional" title="Noticias y comunicados de Usme" description="No fue posible consultar la fuente institucional."><div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-950">No se pudo cargar la cartelera institucional. Intenta de nuevo.</div></JacShell>;

  return <JacShell eyebrow="Información institucional" title="Noticias y comunicados de Usme" description="Cada contenido sincronizado conserva su enlace de origen y estado de validación para facilitar el contraste con la fuente pública.">
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-800"><ShieldCheck className="h-5 w-5" /></span><div><p className="font-serif text-xl font-bold text-emerald-950">Fuente institucional validada</p><p className="mt-1 text-sm leading-6 text-emerald-950/65">Portal oficial de la Alcaldía Local de Usme, con sección pública de noticias y enlaces de origen.</p></div></div><a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800">Visitar fuente <ExternalLink className="h-4 w-4" /></a></div></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><Card className="border-emerald-950/8 bg-white"><CardContent className="p-6"><p className="font-serif text-2xl font-bold text-emerald-950">Configuración de sincronización</p><p className="mt-2 text-sm leading-6 text-emerald-950/60">La aplicación conserva fuente, fecha de consulta, estado de revisión y URL de cada comunicado. La actualización programada se configura al publicar la aplicación.</p><div className="mt-6 rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-emerald-700">Fuentes registradas</p><p className="mt-2 text-2xl font-bold text-emerald-950">{sources.data?.length ?? 0}</p><p className="mt-1 text-xs text-emerald-950/55">La fuente pública fue validada para configuración inicial.</p></div>{user?.role === "admin" ? <Button onClick={() => synchronize.mutate()} disabled={synchronize.isPending} variant="outline" className="mt-5 w-full rounded-xl border-emerald-700 text-emerald-800 hover:bg-emerald-50"><RefreshCw className={`mr-2 h-4 w-4 ${synchronize.isPending ? "animate-spin" : ""}`} />{synchronize.isPending ? "Sincronizando…" : "Sincronizar ahora"}</Button> : null}</CardContent></Card><Card className="border-emerald-950/8 bg-white"><CardContent className="p-0"><div className="border-b border-emerald-950/8 p-6"><div className="flex items-center gap-3"><Newspaper className="h-5 w-5 text-emerald-700" /><p className="font-serif text-2xl font-bold text-emerald-950">Cartelera institucional</p></div></div>{items.length ? <div className="divide-y divide-emerald-950/8">{items.map(item => <article key={item.id} className="p-6"><div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={item.validationStatus} /><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950">Origen <ExternalLink className="h-3.5 w-3.5" /></a></div><h2 className="mt-3 font-serif text-xl font-bold text-emerald-950">{item.title}</h2><p className="mt-2 text-sm leading-6 text-emerald-950/60">{item.summary || "Sin resumen disponible."}</p><p className="mt-3 text-[11px] font-semibold uppercase tracking-[.08em] text-emerald-700">Publicado: {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("es-CO") : "Sin fecha"} · Consultado: {new Date(item.retrievedAt).toLocaleString("es-CO")}</p></article>)}</div> : <div className="grid place-items-center px-6 py-16 text-center"><Newspaper className="h-7 w-7 text-emerald-700" /><p className="mt-4 max-w-sm text-sm leading-6 text-emerald-950/60">No se han sincronizado comunicados aún. La fuente oficial ya está validada y la Directiva técnica puede ejecutar una actualización manual.</p></div>}</CardContent></Card></section>
  </JacShell>;
}
