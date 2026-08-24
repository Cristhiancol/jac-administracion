import { useAuth } from "@/_core/hooks/useAuth";
import { ActivityControl } from "@/components/jac/ActivityControl";
import { JacLoadingState } from "@/components/jac/JacLoadingState";
import { JacShell } from "@/components/jac/JacShell";
import { StatusBadge } from "@/components/jac/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { calculateProgress } from "@/lib/jac-calculations";
import { OFFICIAL_WORK_PLAN_2026_2030 } from "@shared/official-workplan-2026-2030";
import {
  Building2,
  ClipboardPenLine,
  Compass,
  Home,
  Landmark,
  Laptop,
  ListChecks,
  Plus,
  Recycle,
  Scale,
  ShieldCheck,
  Target,
  Users,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function WorkPlan() {
  const { isAuthenticated, user } = useAuth();
  const snapshot = trpc.workPlan.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const commissionsQuery = trpc.workPlan.commissions.useQuery(undefined, { enabled: isAuthenticated });
  const membersQuery = trpc.workPlan.members.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"matriz" | "operativo">("matriz");

  // Plan creation state
  const [title, setTitle] = useState("");
  const [periodLabel, setPeriodLabel] = useState("2026-2030");
  const [objective, setObjective] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Commission state
  const [commissionName, setCommissionName] = useState("");
  const [commissionPurpose, setCommissionPurpose] = useState("");

  // Activity state
  const [activityPlanId, setActivityPlanId] = useState("");
  const [activityCommissionId, setActivityCommissionId] = useState("");
  const [activityResponsibleUserId, setActivityResponsibleUserId] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityGoal, setActivityGoal] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityDueAt, setActivityDueAt] = useState("");

  // Filters
  const [filterPeriod, setFilterPeriod] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCommission, setFilterCommission] = useState("todos");
  const [filterResponsible, setFilterResponsible] = useState("todos");

  const refresh = async () => {
    await Promise.all([utils.workPlan.snapshot.invalidate(), utils.workPlan.commissions.invalidate()]);
  };

  const create = trpc.workPlan.create.useMutation({
    onSuccess: async () => {
      await refresh();
      setTitle("");
      setObjective("");
      toast.success("Plan de trabajo creado en estado borrador.");
    },
    onError: (error) => toast.error(error.message),
  });

  const createCommission = trpc.workPlan.createCommission.useMutation({
    onSuccess: async () => {
      await refresh();
      setCommissionName("");
      setCommissionPurpose("");
      toast.success("Comisión de trabajo registrada.");
    },
    onError: (error) => toast.error(error.message),
  });

  const addActivity = trpc.workPlan.addActivity.useMutation({
    onSuccess: async () => {
      await refresh();
      setActivityTitle("");
      setActivityGoal("");
      setActivityDescription("");
      toast.success("Actividad incorporada al cronograma.");
    },
    onError: (error) => toast.error(error.message),
  });

  const activities = snapshot.data?.activities ?? [];
  const plans = snapshot.data?.plans ?? [];
  const commissions = commissionsQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const movements = snapshot.data?.movements ?? [];

  if (snapshot.isLoading || commissionsQuery.isLoading || membersQuery.isLoading) {
    return (
      <JacShell
        eyebrow="Coordinación de Comité"
        title="Plan de Trabajo Comunal 2026–2030"
        description="Cargando información del plan estratégico."
      >
        <JacLoadingState label="Cargando plan de trabajo" />
      </JacShell>
    );
  }

  const linkedExpense = (activityId: number) =>
    movements
      .filter((movement) => movement.activityId === activityId && movement.movementType === "egreso")
      .reduce((total, movement) => total + Number(movement.amount), 0);

  const filteredActivities = activities.filter((activity) => {
    const plan = plans.find((item) => item.id === activity.workPlanId);
    const periodMatch = filterPeriod === "todos" || plan?.periodLabel === filterPeriod;
    const statusMatch = filterStatus === "todos" || activity.status === filterStatus;
    const commissionMatch =
      filterCommission === "todos" || String(activity.commissionId ?? "sin-comision") === filterCommission;
    const responsibleMatch =
      filterResponsible === "todos" || String(activity.responsibleUserId ?? "sin-responsable") === filterResponsible;
    return periodMatch && statusMatch && commissionMatch && responsibleMatch;
  });

  const completed = activities.filter((item) => item.status === "completada").length;

  return (
    <JacShell
      eyebrow="Gobernanza Estratégica 2026–2030"
      title="Plan de Trabajo Comunal — JAC Bellavista"
      description="Ejes estratégicos de gestión, organización legal, infraestructura, seguridad, residuos, tecnología y finanzas para la comunidad."
    >
      {/* Navigation Sub-Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("matriz")}
            variant={activeTab === "matriz" ? "default" : "outline"}
            className={`rounded-xl font-bold gap-2 ${
              activeTab === "matriz"
                ? "bg-[#0F4C81] text-white hover:bg-[#0D3A66]"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <Compass className="h-4 w-4" />
            Matriz Estratégica (2026 – 2030)
          </Button>
          <Button
            onClick={() => setActiveTab("operativo")}
            variant={activeTab === "operativo" ? "default" : "outline"}
            className={`rounded-xl font-bold gap-2 ${
              activeTab === "operativo"
                ? "bg-[#1B8A5A] text-white hover:bg-[#166534]"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <ListChecks className="h-4 w-4" />
            Cronograma Operativo & Comisiones
          </Button>
        </div>

        <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          Vigencia Oficial: 2026 – 2030
        </span>
      </div>

      {/* METRIC CARDS */}
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={Compass}
          title="Ejes Estratégicos"
          body="8 ejes priorizados: Organización, Salón, Seguridad, Residuos, Tecnología, Tesorería, Convivencia y Gestión."
        />
        <InfoCard
          icon={UsersRound}
          title="Comisiones de Trabajo"
          body={`${commissions.length} comisiones registradas. Asignación de responsabilidades y evidencias auditables.`}
        />
        <InfoCard
          icon={ListChecks}
          title="Avance Operativo"
          body={`${calculateProgress(completed, activities.length)}% de ejecución global basada en metas verificables.`}
        />
      </section>

      {/* TAB 1: OFFICIAL WORK PLAN 2026-2030 MATRIX */}
      {activeTab === "matriz" && (
        <div className="mt-8 space-y-6 animate-in fade-in-50 duration-300">
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <div className="border-b border-border bg-[#0F4C81]/10 dark:bg-blue-950/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-extrabold text-foreground">
                  Resumen del Plan de Trabajo — JAC Bellavista 2026–2030
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hoja de ruta comunal acordada para la organización, legalidad, infraestructura y bienestar del barrio Bellavista.
                </p>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-black text-muted-foreground uppercase tracking-wider">
                      <th className="p-4 w-44">Eje Estratégico</th>
                      <th className="p-4">Actividades Principales</th>
                      <th className="p-4">Resultado Esperado</th>
                      <th className="p-4 w-48">Comisión Sugerida</th>
                      <th className="p-4 text-center w-36">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {OFFICIAL_WORK_PLAN_2026_2030.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-4 font-bold text-foreground flex items-center gap-2">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:bg-blue-900/30 dark:text-blue-300">
                            {renderIcon(item.icono)}
                          </span>
                          <span>{item.eje}</span>
                        </td>
                        <td className="p-4 text-muted-foreground font-medium leading-relaxed">{item.actividades}</td>
                        <td className="p-4 font-semibold text-foreground leading-relaxed">{item.resultadoEsperado}</td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                            {item.comisionSugerida}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {item.estado === "en_ejecucion" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-300">
                              <span className="h-2 w-2 rounded-full bg-[#1B8A5A] animate-pulse" />
                              En Ejecución
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold border border-blue-200">
                              Planeada
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: OPERATIONAL SCHEDULE & COMMISSIONS */}
      {activeTab === "operativo" && (
        <div className="mt-8 space-y-6 animate-in fade-in-50 duration-300">
          <section className="grid gap-6 xl:grid-cols-2">
            {/* CREATE PLAN CARD */}
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-serif text-2xl font-bold text-foreground">Nuevo Plan de Gestión</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Define el periodo, objetivo y alcance comunitario.</p>
                {isAuthenticated ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      create.mutate({
                        title,
                        periodLabel,
                        objective,
                        startsAt: new Date(startsAt),
                        endsAt: new Date(endsAt),
                      });
                    }}
                    className="mt-6 grid gap-4"
                  >
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nombre del plan (ej. Plan Estratégico 2026-2030)"
                      required
                      className="rounded-xl border-border"
                    />
                    <Input
                      value={periodLabel}
                      onChange={(e) => setPeriodLabel(e.target.value)}
                      placeholder="Periodo (ej. 2026-2030)"
                      required
                      className="rounded-xl border-border"
                    />
                    <Textarea
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="Objetivo estratégico y metas comunitarias"
                      required
                      className="min-h-28 rounded-xl border-border"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="date"
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                        required
                        className="rounded-xl border-border"
                      />
                      <Input
                        type="date"
                        value={endsAt}
                        onChange={(e) => setEndsAt(e.target.value)}
                        required
                        className="rounded-xl border-border"
                      />
                    </div>
                    <Button disabled={create.isPending} className="rounded-xl bg-[#0F4C81] hover:bg-[#0D3A66] text-white font-bold">
                      <Plus className="mr-2 h-4 w-4 text-amber-300" />
                      Crear Plan
                    </Button>
                  </form>
                ) : (
                  <AccessNote />
                )}
              </CardContent>
            </Card>

            {/* CREATE COMMISSION CARD */}
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-serif text-2xl font-bold text-foreground">Comisión de Trabajo</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Registra comisiones de trabajo (Obras, Seguridad, Residuos, Tecnología, Deportes, etc.).
                </p>
                {isAuthenticated ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      createCommission.mutate({ name: commissionName, purpose: commissionPurpose || null });
                    }}
                    className="mt-6 grid gap-4"
                  >
                    <Input
                      value={commissionName}
                      onChange={(e) => setCommissionName(e.target.value)}
                      placeholder="Ej. Comité de Seguridad y Convivencia"
                      required
                      className="rounded-xl border-border"
                    />
                    <Textarea
                      value={commissionPurpose}
                      onChange={(e) => setCommissionPurpose(e.target.value)}
                      placeholder="Propósito, funciones y alcance de la comisión"
                      className="min-h-28 rounded-xl border-border"
                    />
                    <Button disabled={createCommission.isPending} variant="outline" className="rounded-xl border-[#1B8A5A] text-[#1B8A5A] hover:bg-emerald-50 font-bold">
                      <UsersRound className="mr-2 h-4 w-4" />
                      Registrar Comisión
                    </Button>
                  </form>
                ) : (
                  <AccessNote />
                )}
              </CardContent>
            </Card>
          </section>

          {/* PROGRAM ACTIVITY & ACTIVITIES LIST */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-serif text-2xl font-bold text-foreground">Programar Actividad</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Vincula la actividad con un plan, comisión, responsable y fecha límite.
                </p>
                {isAuthenticated ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      addActivity.mutate({
                        workPlanId: Number(activityPlanId),
                        commissionId: activityCommissionId ? Number(activityCommissionId) : null,
                        responsibleUserId: activityResponsibleUserId ? Number(activityResponsibleUserId) : user?.id ?? null,
                        title: activityTitle,
                        goal: activityGoal,
                        description: activityDescription || null,
                        dueAt: new Date(activityDueAt),
                      });
                    }}
                    className="mt-6 grid gap-4"
                  >
                    <select
                      value={activityPlanId}
                      onChange={(e) => setActivityPlanId(e.target.value)}
                      required
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-[#0F4C81] outline-none"
                    >
                      <option value="">Selecciona un plan *</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title} · {plan.periodLabel}
                        </option>
                      ))}
                    </select>

                    <select
                      value={activityCommissionId}
                      onChange={(e) => setActivityCommissionId(e.target.value)}
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-[#0F4C81] outline-none"
                    >
                      <option value="">Comisión por definir</option>
                      {commissions.map((commission) => (
                        <option key={commission.id} value={commission.id}>
                          {commission.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={activityResponsibleUserId}
                      onChange={(e) => setActivityResponsibleUserId(e.target.value)}
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-[#0F4C81] outline-none"
                    >
                      <option value="">Responsable: Usuario actual</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name || member.email || `Usuario ${member.id}`} · {member.jacRole}
                        </option>
                      ))}
                    </select>

                    <Input
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      placeholder="Nombre de la actividad"
                      required
                      className="rounded-xl border-border"
                    />

                    <Textarea
                      value={activityGoal}
                      onChange={(e) => setActivityGoal(e.target.value)}
                      placeholder="Meta verificable"
                      required
                      className="min-h-20 rounded-xl border-border"
                    />

                    <Textarea
                      value={activityDescription}
                      onChange={(e) => setActivityDescription(e.target.value)}
                      placeholder="Descripción o evidencia esperada"
                      className="min-h-20 rounded-xl border-border"
                    />

                    <Input
                      type="date"
                      value={activityDueAt}
                      onChange={(e) => setActivityDueAt(e.target.value)}
                      required
                      className="rounded-xl border-border"
                    />

                    <Button disabled={addActivity.isPending || !plans.length} className="rounded-xl bg-[#1B8A5A] hover:bg-[#166534] text-white font-bold">
                      <Target className="mr-2 h-4 w-4" />
                      Agregar Actividad
                    </Button>
                  </form>
                ) : (
                  <AccessNote />
                )}
              </CardContent>
            </Card>

            {/* ACTIVITIES & GOALS TABLE */}
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-0">
                <div className="border-b border-border p-6">
                  <h2 className="font-serif text-2xl font-bold text-foreground">Actividades y Metas</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Registro operativo por comisión, responsable y periodo.</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <select
                      value={filterPeriod}
                      onChange={(event) => setFilterPeriod(event.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                    >
                      <option value="todos">Todos los periodos</option>
                      {Array.from(new Set(plans.map((plan) => plan.periodLabel))).map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterCommission}
                      onChange={(event) => setFilterCommission(event.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                    >
                      <option value="todos">Todas las comisiones</option>
                      <option value="sin-comision">Sin comisión</option>
                      {commissions.map((commission) => (
                        <option key={commission.id} value={commission.id}>
                          {commission.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterResponsible}
                      onChange={(event) => setFilterResponsible(event.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                    >
                      <option value="todos">Todos los responsables</option>
                      <option value="sin-responsable">Sin responsable</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name || member.email || `Usuario ${member.id}`}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(event) => setFilterStatus(event.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="completada">Completada</option>
                      <option value="bloqueada">Bloqueada</option>
                    </select>
                  </div>
                </div>

                {activities.length ? (
                  <div className="divide-y divide-border">
                    {filteredActivities.map((item) => (
                      <div key={item.id} className="p-5 hover:bg-muted/40 transition-colors">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {item.progress}%
                          </span>
                          <div className="min-w-48 flex-1">
                            <p className="text-sm font-bold text-foreground">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.goal}</p>
                            <p className="mt-1 text-[11px] font-semibold text-[#1B8A5A] dark:text-emerald-400">
                              Vence: {new Date(item.dueAt).toLocaleDateString("es-CO")} · Responsable:{" "}
                              {members.find((member) => member.id === item.responsibleUserId)?.name ||
                                members.find((member) => member.id === item.responsibleUserId)?.email ||
                                "Sin asignar"}{" "}
                              · Gastos:{" "}
                              {new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                maximumFractionDigits: 0,
                              }).format(linkedExpense(item.id))}
                            </p>
                          </div>
                          <StatusBadge
                            status={
                              item.status === "completada"
                                ? "cumplida"
                                : item.status === "en_proceso"
                                ? "en_proceso"
                                : item.status === "bloqueada"
                                ? "observado"
                                : "pendiente"
                            }
                          />
                        </div>
                        {isAuthenticated && <ActivityControl activity={item} />}
                      </div>
                    ))}
                    {filteredActivities.length === 0 && (
                      <p className="p-6 text-center text-sm text-muted-foreground">
                        No hay actividades que coincidan con los filtros.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid place-items-center px-6 py-16 text-center">
                    <ClipboardPenLine className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      No hay actividades registradas todavía. Crea el plan y luego agrega sus metas por comisión.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </JacShell>
  );
}

function renderIcon(iconName: string) {
  switch (iconName) {
    case "Scale":
      return <Scale className="h-4 w-4" />;
    case "Home":
      return <Home className="h-4 w-4" />;
    case "ShieldCheck":
      return <ShieldCheck className="h-4 w-4" />;
    case "Recycle":
      return <Recycle className="h-4 w-4" />;
    case "Laptop":
      return <Laptop className="h-4 w-4" />;
    case "Landmark":
      return <Landmark className="h-4 w-4" />;
    case "Users":
      return <Users className="h-4 w-4" />;
    case "Building2":
      return <Building2 className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof UsersRound; title: string; body: string }) {
  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl">
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-[#1B8A5A] dark:text-emerald-400" />
        <p className="mt-4 text-sm font-bold text-foreground">{title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function AccessNote() {
  return (
    <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs font-semibold text-amber-800 dark:text-amber-300">
      Inicia sesión con el rol asignado para crear y editar el plan comunal.
    </div>
  );
}
