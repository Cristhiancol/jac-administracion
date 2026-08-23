import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { StatusBadge } from "@/components/jac/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { calculateBalance, calculateProgress } from "@/lib/jac-calculations";
import { ArrowUpRight, CalendarCheck2, CircleDollarSign, ClipboardList, Landmark, ShieldAlert, Target } from "lucide-react";
import { Link } from "wouter";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const snapshot = trpc.workPlan.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const data = snapshot.data;
  const movements = data?.movements ?? [];
  const income = movements.filter(item => item.movementType === "ingreso").reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = movements.filter(item => item.movementType === "egreso").reduce((sum, item) => sum + Number(item.amount), 0);
  const activities = data?.activities ?? [];
  const completed = activities.filter(item => item.status === "completada").length;
  const pendingObligations = (data?.obligations ?? []).filter(item => item.status !== "cumplida").length;
  const profileVerified = data?.profile?.verificationStatus === "verificado";

  return (
    <JacShell eyebrow="Panel principal" title="Gestión comunal con trazabilidad" description="Un espacio de coordinación para convertir las metas de la JAC en actividades, obligaciones y movimientos verificables.">
      <section className="jac-grid relative overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-7 text-white shadow-[0_25px_70px_-35px_rgba(6,78,59,.75)] sm:px-9 sm:py-10">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200"><Landmark className="h-4 w-4" /> Localidad de Usme</div>
            <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">Junta de Acción Comunal Barrio Usme Centro</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75">{profileVerified ? "La ficha institucional cuenta con NIT, personería jurídica, código comunal y ubicación confirmados por la Directiva." : "La ficha institucional se encuentra disponible para revisión de la Directiva y conserva los campos pendientes de evidencia."}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100/70">Estado institucional</p>
            <div className="mt-3 flex items-center justify-between gap-3"><span className="text-lg font-bold">{data?.profile?.verificationStatus === "verificado" ? "Datos confirmados" : "Validación pendiente"}</span><StatusBadge status={data?.profile?.verificationStatus ?? "pendiente"} /></div>
            <Link href="/institucion" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-200 transition-colors hover:text-amber-100">Revisar ficha institucional <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Target} label="Avance de actividades" value={`${calculateProgress(completed, activities.length)}%`} detail={activities.length ? `${completed} de ${activities.length} completadas` : "Aún no hay actividades registradas"} tone="emerald" />
        <Metric icon={CircleDollarSign} label="Balance presupuestal" value={formatCurrency(calculateBalance(income, expenses))} detail={movements.length ? `${movements.length} movimientos registrados` : "Sin movimientos registrados"} tone="amber" />
        <Metric icon={ShieldAlert} label="Obligaciones abiertas" value={String(pendingObligations)} detail={pendingObligations ? "Requieren seguimiento" : "Sin obligaciones pendientes"} tone="sky" />
        <Metric icon={CalendarCheck2} label="Reservas del salón" value={String(data?.reservations.filter(item => item.status === "aprobada").length ?? 0)} detail="Reservas aprobadas próximas" tone="rose" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <Card className="border-emerald-950/8 bg-white shadow-[0_18px_45px_-35px_rgba(6,78,59,.55)]">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-emerald-950/8 p-5 sm:p-6"><div><p className="font-serif text-xl font-bold text-emerald-950">Seguimiento del plan comunal</p><p className="mt-1 text-sm text-emerald-950/55">Metas y actividades por comisión</p></div><Link href="/plan-de-trabajo" className="rounded-xl bg-emerald-50 p-2 text-emerald-800 transition-colors hover:bg-emerald-100" aria-label="Ver plan comunal"><ArrowUpRight className="h-4 w-4" /></Link></div>
            <div className="divide-y divide-emerald-950/8">
              {activities.length ? activities.slice(0, 4).map(item => <div key={item.id} className="flex items-center gap-4 p-5 sm:px-6"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800">{item.progress}%</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-emerald-950">{item.title}</p><p className="mt-1 truncate text-xs text-emerald-950/55">Meta: {item.goal}</p></div><span className="text-xs font-semibold capitalize text-emerald-950/60">{item.status.replaceAll("_", " ")}</span></div>) : <EmptyState icon={ClipboardList} text="Registra el primer plan y sus actividades para iniciar el seguimiento por comisión." link="/plan-de-trabajo" label="Crear plan de trabajo" />}
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-950/8 bg-white shadow-[0_18px_45px_-35px_rgba(6,78,59,.55)]"><CardContent className="p-6"><p className="font-serif text-xl font-bold text-emerald-950">Accesos de coordinación</p><p className="mt-1 text-sm leading-6 text-emerald-950/55">Organiza el trabajo de cada comité con información preparada para auditoría interna.</p><div className="mt-6 grid gap-3"><QuickLink href="/plan-de-trabajo" icon={Target} title="Plan de trabajo" detail="Metas, responsables y evidencias" /><QuickLink href="/obligaciones" icon={ShieldAlert} title="Matriz legal" detail="Calendario y soportes de cumplimiento" /><QuickLink href="/finanzas" icon={CircleDollarSign} title="Tesorería" detail="Ingresos, gastos y balance" /></div></CardContent></Card>
      </section>
    </JacShell>
  );
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Target; label: string; value: string; detail: string; tone: "emerald" | "amber" | "sky" | "rose" }) {
  const palette = { emerald: "bg-emerald-100 text-emerald-800", amber: "bg-amber-100 text-amber-800", sky: "bg-sky-100 text-sky-800", rose: "bg-rose-100 text-rose-800" }[tone];
  return <Card className="border-emerald-950/8 bg-white shadow-[0_12px_32px_-28px_rgba(6,78,59,.45)]"><CardContent className="p-5"><div className="flex items-start justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl ${palette}`}><Icon className="h-4 w-4" /></span><span className="text-xs font-bold uppercase tracking-[.12em] text-emerald-950/45">En vivo</span></div><p className="mt-5 text-xs font-bold uppercase tracking-[.12em] text-emerald-950/55">{label}</p><p className="mt-1 font-serif text-2xl font-bold text-emerald-950">{value}</p><p className="mt-2 text-xs leading-5 text-emerald-950/55">{detail}</p></CardContent></Card>;
}

function QuickLink({ href, icon: Icon, title, detail }: { href: string; icon: typeof Target; title: string; detail: string }) {
  return <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-emerald-950/8 p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-emerald-950">{title}</span><span className="mt-0.5 block truncate text-xs text-emerald-950/55">{detail}</span></span><ArrowUpRight className="h-4 w-4 text-emerald-800/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>;
}

function EmptyState({ icon: Icon, text, link, label }: { icon: typeof Target; text: string; link: string; label: string }) {
  return <div className="px-6 py-10 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-emerald-950/60">{text}</p><Link href={link} className="mt-4 inline-flex text-sm font-bold text-emerald-800 hover:text-emerald-950">{label}</Link></div>;
}
