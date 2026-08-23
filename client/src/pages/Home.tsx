import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { StatusBadge } from "@/components/jac/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { calculateBalance, calculateProgress } from "@/lib/jac-calculations";
import {
  ArrowUpRight,
  CalendarCheck2,
  CircleDollarSign,
  ClipboardList,
  ShieldAlert,
  Target,
  Trophy,
  Users,
  TreePine,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";
import { JacLogo } from "@/components/JacLogo";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const snapshot = trpc.workPlan.snapshot.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const data = snapshot.data;
  const movements = data?.movements ?? [];
  const income = movements
    .filter((item) => item.movementType === "ingreso")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = movements
    .filter((item) => item.movementType === "egreso")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const activities = data?.activities ?? [];
  const completed = activities.filter((item) => item.status === "completada").length;
  const pendingObligations = (data?.obligations ?? []).filter(
    (item) => item.status !== "cumplida"
  ).length;
  const profileVerified = data?.profile?.verificationStatus === "verificado";

  return (
    <JacShell
      eyebrow="Panel Comunitario Unificado"
      title="Gestión Participativa Bellavista 1991"
      description="Plataforma de gobernanza, transparencia financiera, registro de afiliados y desarrollo social para nuestra comunidad en Usme."
    >
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F4C81] via-[#1B8A5A] to-[#166534] p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur border border-white/20 text-xs font-extrabold uppercase tracking-wider text-amber-300">
              <TreePine className="h-4 w-4" /> Localidad de Usme · Bogotá D.C.
            </div>

            <h2 className="font-serif text-3xl font-black leading-tight sm:text-4xl lg:text-5xl drop-shadow-sm">
              Junta de Acción Comunal Bellavista (1991)
            </h2>

            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-emerald-50/90 font-medium">
              {profileVerified
                ? "Personería jurídica, NIT y registro de dignatarios verificados. Impulsando la huerta urbana, deportes comunales y gobernabilidad transparente."
                : "Portal institucional activo para el censo de afiliados, asambleas de vecinos y control de presupuestos participativos."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                <CheckCircle2 className="h-4 w-4 text-amber-400" /> Lema: "Todos Somos Comunidad"
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-400/30">
                <Trophy className="h-4 w-4 text-amber-300" /> Campeonatos & Cultura 2026
              </span>
            </div>
          </div>

          {/* Institutional Badge Card */}
          <div className="rounded-2xl border border-white/20 bg-white/15 p-6 backdrop-blur-md shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <JacLogo size="sm" variant="icon" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                    Ficha Comunal
                  </p>
                  <p className="text-base font-extrabold text-white">
                    JAC Bellavista 1991
                  </p>
                </div>
              </div>
              <StatusBadge status={data?.profile?.verificationStatus ?? "pendiente"} />
            </div>

            <p className="text-xs text-white/80 leading-relaxed border-t border-white/10 pt-3">
              Representación legal vigente y código comunal registrado ante el IDPAC.
            </p>

            <Link
              href="/institucion"
              className="group flex items-center justify-between w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-slate-950 hover:bg-amber-300 transition-all shadow-md"
            >
              <span>Ver Ficha e Identidad</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Target}
          label="Avance de Actividades"
          value={`${calculateProgress(completed, activities.length)}%`}
          detail={
            activities.length
              ? `${completed} de ${activities.length} metas completadas`
              : "Sin actividades en periodo actual"
          }
          tone="emerald"
        />
        <Metric
          icon={CircleDollarSign}
          label="Saldo de Tesorería"
          value={formatCurrency(calculateBalance(income, expenses))}
          detail={
            movements.length
              ? `${movements.length} transacciones auditadas`
              : "Sin movimientos en caja"
          }
          tone="amber"
        />
        <Metric
          icon={ShieldAlert}
          label="Matriz Legal & Libros"
          value={String(pendingObligations)}
          detail={
            pendingObligations
              ? "Revisión prioritaria requerida"
              : "Libros y actas al día"
          }
          tone="sky"
        />
        <Metric
          icon={CalendarCheck2}
          label="Reservas Salón Comunal"
          value={String(
            data?.reservations.filter((item) => item.status === "aprobada").length ?? 0
          )}
          detail="Eventos comunales confirmados"
          tone="rose"
        />
      </section>

      {/* Content Columns */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        {/* Work Plan Tracking */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
              <div>
                <p className="font-serif text-xl font-bold text-foreground">
                  Proyectos & Comisiones de Trabajo
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Desarrollo social, huerta barrial, deportes y seguridad
                </p>
              </div>
              <Link
                href="/plan-de-trabajo"
                className="rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:bg-emerald-950/60 dark:text-emerald-300 p-2.5 hover:bg-[#0F4C81]/20 transition-colors"
                aria-label="Ver plan comunal"
              >
                <ArrowUpRight className="h-4.5 w-4.5" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {activities.length ? (
                activities.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/40 sm:px-6"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-sm font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                      {item.progress}%
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Meta: {item.goal}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {item.status.replaceAll("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  text="Registra las actividades de tu comisión para dar seguimiento a las metas comunitarias."
                  link="/plan-de-trabajo"
                  label="Crear Actividad Comunal"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <p className="font-serif text-xl font-bold text-foreground">
              Módulos de Gestión
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Accesos directos para la Directiva, afiliados y vecinos del barrio Bellavista.
            </p>
            <div className="mt-6 grid gap-3">
              <QuickLink
                href="/plan-de-trabajo"
                icon={Target}
                title="Plan de Trabajo & Comisiones"
                detail="Proyectos, huertas y comités"
              />
              <QuickLink
                href="/obligaciones"
                icon={ShieldAlert}
                title="Libro de Afiliados & Normativa"
                detail="Estatutos, actas y quórum"
              />
              <QuickLink
                href="/finanzas"
                icon={CircleDollarSign}
                title="Tesorería & Cuentas Claras"
                detail="Ingresos, aportes y egresos"
              />
              <QuickLink
                href="/institucion"
                icon={Users}
                title="Carnet Comunal Digital"
                detail="Identidad comunitaria QR"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </JacShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "amber" | "sky" | "rose";
}) {
  const palette = {
    emerald: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
    sky: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
    rose: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300",
  }[tone];

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${palette}`}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            En vivo
          </span>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-serif text-2xl font-black text-foreground">
          {value}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground font-medium">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: typeof Target;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-xl border border-border p-3.5 transition-all hover:-translate-y-0.5 hover:border-[#0F4C81] hover:bg-[#0F4C81]/5 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/20"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-foreground group-hover:text-[#0F4C81] dark:group-hover:text-emerald-400">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {detail}
        </span>
      </span>
      <ArrowUpRight className="h-4.5 w-4.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0F4C81] dark:group-hover:text-emerald-400" />
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  text,
  link,
  label,
}: {
  icon: typeof Target;
  text: string;
  link: string;
  label: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
      <Link
        href={link}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0F4C81] dark:text-emerald-400 hover:underline"
      >
        {label} <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
