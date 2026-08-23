import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { JacLoadingState } from "@/components/jac/JacLoadingState";
import { SupportFileInput } from "@/components/jac/SupportFileInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { calculateBalance, getBudgetExecution } from "@/lib/jac-calculations";
import {
  REPORTED_EXPENSES_BY_CATEGORY,
  REPORTED_EXPENSES_BY_MONTH,
  TOTAL_EXPENSES_2025,
  TOTAL_EXPENSES_2026,
  TOTAL_EXPENSES_ALL,
} from "@shared/reported-expenses";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Landmark,
  Plus,
  ReceiptText,
  WalletCards,
  PieChart,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDecimalCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

const groupValues = (items: Array<{ key: string; value: number }>) =>
  Object.entries(
    items.reduce<Record<string, number>>(
      (acc, item) => ({ ...acc, [item.key]: (acc[item.key] ?? 0) + item.value }),
      {},
    ),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

export default function Finance() {
  const { isAuthenticated } = useAuth();
  const snapshot = trpc.finance.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const workPlanSnapshot = trpc.workPlan.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"resumen" | "reporte">("reporte");
  const [movementType, setMovementType] = useState<"ingreso" | "egreso">("egreso");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("Aportes comunitarios");
  const [activityId, setActivityId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [supportUrl, setSupportUrl] = useState("");
  const [budgetSource, setBudgetSource] = useState("Aportes comunitarios");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState(String(new Date().getFullYear()));
  const [selectedPeriod, setSelectedPeriod] = useState(String(new Date().getFullYear()));

  const record = trpc.finance.record.useMutation({
    onSuccess: async () => {
      await utils.finance.snapshot.invalidate();
      setCategory("");
      setDescription("");
      setAmount("");
      setSupportUrl("");
      toast.success("Movimiento financiero registrado.");
    },
    onError: (error) => toast.error(error.message),
  });

  const setBudget = trpc.finance.setBudget.useMutation({
    onSuccess: async () => {
      await utils.finance.snapshot.invalidate();
      setBudgetAmount("");
      toast.success("Presupuesto aprobado actualizado.");
    },
    onError: (error) => toast.error(error.message),
  });

  const movements = snapshot.data?.movements ?? [];
  const budgets = snapshot.data?.budgets ?? [];
  const activities = workPlanSnapshot.data?.activities ?? [];

  const availablePeriods = Array.from(
    new Set([
      String(new Date().getFullYear()),
      ...movements.map((item) => String(new Date(item.occurredAt).getFullYear())),
      ...budgets.map((item) => item.periodLabel),
    ]),
  )
    .sort()
    .reverse();

  const periodMovements = useMemo(
    () =>
      selectedPeriod === "todos"
        ? movements
        : movements.filter((item) => String(new Date(item.occurredAt).getFullYear()) === selectedPeriod),
    [movements, selectedPeriod],
  );

  const income = periodMovements
    .filter((item) => item.movementType === "ingreso")
    .reduce((total, item) => total + Number(item.amount), 0);
  const expenses = periodMovements
    .filter((item) => item.movementType === "egreso")
    .reduce((total, item) => total + Number(item.amount), 0);
  const balance = calculateBalance(income, expenses);

  const approvedBudget = budgets
    .filter((item) => selectedPeriod === "todos" || item.periodLabel === selectedPeriod)
    .reduce((total, item) => total + Number(item.approvedAmount), 0);
  const execution = getBudgetExecution(expenses, approvedBudget);

  const byCategory = groupValues(
    periodMovements
      .filter((item) => item.movementType === "egreso")
      .map((item) => ({ key: item.category, value: Number(item.amount) })),
  );
  const bySource = groupValues(
    periodMovements.map((item) => ({ key: item.source, value: Number(item.amount) })),
  );

  const maxCategory = Math.max(...byCategory.map((item) => item.value), 1);
  const maxSource = Math.max(...bySource.map((item) => item.value), 1);

  if (snapshot.isLoading || workPlanSnapshot.isLoading) {
    return (
      <JacShell
        eyebrow="Tesorería y Transparencia"
        title="Ingresos, Gastos y Balances"
        description="Cargando información financiera."
      >
        <JacLoadingState label="Cargando tesorería comunal" />
      </JacShell>
    );
  }

  return (
    <JacShell
      eyebrow="Tesorería y Rendición de Cuentas"
      title="Gestión Financiera & Gastos Consolidados"
      description="Reporte oficial de gastos por categoría y mes, auditoría de caja menor, servicios públicos y presupuesto participativo."
    >
      {/* Sub-Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("reporte")}
            variant={activeTab === "reporte" ? "default" : "outline"}
            className={`rounded-xl font-bold gap-2 ${
              activeTab === "reporte"
                ? "bg-[#0F4C81] text-white hover:bg-[#0D3A66]"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Reporte Consolidado (2025 - 2026)
          </Button>
          <Button
            onClick={() => setActiveTab("resumen")}
            variant={activeTab === "resumen" ? "default" : "outline"}
            className={`rounded-xl font-bold gap-2 ${
              activeTab === "resumen"
                ? "bg-[#1B8A5A] text-white hover:bg-[#166534]"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Libro de Caja & Movimientos
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vigencia:</span>
          <select
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground focus:ring-2 focus:ring-[#0F4C81] outline-none"
          >
            <option value="todos">Todas las vigencias</option>
            {availablePeriods.map((period) => (
              <option key={period} value={period}>
                Vigencia {period}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY BANNER METRICS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gastos 2025</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                Ejecutado
              </span>
            </div>
            <p className="mt-2 font-serif text-2xl font-black text-foreground">{money(TOTAL_EXPENSES_2025)}</p>
            <p className="mt-1 text-xs text-muted-foreground">30.3% del acumulado total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gastos 2026</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                En curso
              </span>
            </div>
            <p className="mt-2 font-serif text-2xl font-black text-[#1B8A5A] dark:text-emerald-400">{money(TOTAL_EXPENSES_2026)}</p>
            <p className="mt-1 text-xs text-muted-foreground">69.7% del acumulado total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-[#0F4C81] text-white shadow-md rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Total Acumulado</span>
              <DollarSign className="h-5 w-5 text-amber-300" />
            </div>
            <p className="mt-2 font-serif text-2xl font-black text-white">{money(TOTAL_EXPENSES_ALL)}</p>
            <p className="mt-1 text-xs text-emerald-100/80">100.0% reportado a la fecha</p>
          </CardContent>
        </Card>
      </div>

      {/* TAB 1: OFFICIAL CONSOLIDATED REPORT TABLES */}
      {activeTab === "reporte" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          {/* TABLE 1: GASTO POR CATEGORÍA */}
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <div className="border-b border-border bg-emerald-900/10 dark:bg-emerald-950/40 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-extrabold text-foreground flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-[#1B8A5A]" />
                  Gasto por Categoría
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Desglose consolidado por rubros operativos, servicios públicos y actividades comunales.
                </p>
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0F4C81] text-white self-start sm:self-auto">
                Total: {money(TOTAL_EXPENSES_ALL)}
              </span>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-black text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Categoría</th>
                      <th className="p-4 text-right">2025</th>
                      <th className="p-4 text-right">2026</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-right">% del Total</th>
                      <th className="p-4 w-32">Distribución</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {REPORTED_EXPENSES_BY_CATEGORY.map((item) => (
                      <tr key={item.category} className="hover:bg-muted/40 transition-colors">
                        <td className="p-4 font-bold text-foreground">{item.category}</td>
                        <td className="p-4 text-right font-mono text-emerald-800 dark:text-emerald-400 font-semibold">
                          {item.year2025 > 0 ? money(item.year2025) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono text-emerald-800 dark:text-emerald-400 font-semibold">
                          {item.year2026 > 0 ? money(item.year2026) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono font-extrabold text-foreground">{money(item.total)}</td>
                        <td className="p-4 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                          {item.percentage.toFixed(1)}%
                        </td>
                        <td className="p-4">
                          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#0F4C81] to-[#1B8A5A]"
                              style={{ width: `${Math.min(100, item.percentage * 2.5)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-emerald-950/10 dark:bg-emerald-950/40 font-black text-foreground">
                      <td className="p-4 font-serif text-base uppercase tracking-wider">TOTAL</td>
                      <td className="p-4 text-right font-mono text-base text-[#1B8A5A] dark:text-emerald-400">
                        {money(TOTAL_EXPENSES_2025)}
                      </td>
                      <td className="p-4 text-right font-mono text-base text-[#1B8A5A] dark:text-emerald-400">
                        {money(TOTAL_EXPENSES_2026)}
                      </td>
                      <td className="p-4 text-right font-mono text-base text-[#0F4C81] dark:text-blue-300">
                        {money(TOTAL_EXPENSES_ALL)}
                      </td>
                      <td className="p-4 text-right font-mono text-base text-amber-700 dark:text-amber-400">100.0%</td>
                      <td className="p-4" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* TABLE 2: GASTO POR MES REPORTADO */}
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <div className="border-b border-border bg-blue-900/10 dark:bg-blue-950/40 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-extrabold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0F4C81]" />
                  Gasto por Mes Reportado
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Evolución mensual de egresos comparativo entre las vigencias 2025 y 2026.
                </p>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-black text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Mes</th>
                      <th className="p-4 text-right">2025</th>
                      <th className="p-4 text-right">2026</th>
                      <th className="p-4 text-right">Total Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {REPORTED_EXPENSES_BY_MONTH.map((item) => (
                      <tr
                        key={item.month}
                        className={`hover:bg-muted/40 transition-colors ${
                          item.month === "Sin mes reportado" ? "bg-amber-500/5 font-semibold" : ""
                        }`}
                      >
                        <td className="p-4 font-bold text-foreground flex items-center gap-2">
                          {item.month === "Sin mes reportado" ? (
                            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                          ) : (
                            <span className="inline-block h-2 w-2 rounded-full bg-[#0F4C81]" />
                          )}
                          {item.month}
                        </td>
                        <td className="p-4 text-right font-mono text-emerald-800 dark:text-emerald-400">
                          {item.year2025 > 0 ? money(item.year2025) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono text-emerald-800 dark:text-emerald-400">
                          {item.year2026 > 0 ? money(item.year2026) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono font-extrabold text-foreground">{money(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-blue-950/10 dark:bg-blue-950/40 font-black text-foreground">
                      <td className="p-4 font-serif text-base uppercase tracking-wider">TOTAL</td>
                      <td className="p-4 text-right font-mono text-base text-[#1B8A5A] dark:text-emerald-400">
                        {money(TOTAL_EXPENSES_2025)}
                      </td>
                      <td className="p-4 text-right font-mono text-base text-[#1B8A5A] dark:text-emerald-400">
                        {money(TOTAL_EXPENSES_2026)}
                      </td>
                      <td className="p-4 text-right font-mono text-base text-[#0F4C81] dark:text-blue-300">
                        {money(TOTAL_EXPENSES_ALL)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: CASH LEDGER & MOVEMENTS */}
      {activeTab === "resumen" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <section className="grid gap-4 md:grid-cols-3">
            <FinanceCard
              icon={ArrowDownRight}
              label={`Ingresos ${selectedPeriod}`}
              value={money(income)}
              detail="Aportes, alquileres y actividades comunales"
              tone="emerald"
            />
            <FinanceCard
              icon={ArrowUpRight}
              label={`Egresos ${selectedPeriod}`}
              value={money(expenses)}
              detail="Servicios, mantenimiento y caja menor"
              tone="rose"
            />
            <FinanceCard
              icon={WalletCards}
              label="Balance Disponible"
              value={money(balance)}
              detail={`${periodMovements.length} movimientos en la vigencia`}
              tone="amber"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
            {/* REGISTER MOVEMENT FORM */}
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <p className="font-serif text-2xl font-bold text-foreground">Registrar Movimiento</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  El Tesorero, Fiscal o Directiva puede registrar movimientos con evidencia enlazada.
                </p>

                {isAuthenticated ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      record.mutate({
                        movementType,
                        category,
                        source,
                        description,
                        amount,
                        occurredAt: new Date(occurredAt),
                        supportUrl: supportUrl || null,
                        activityId: activityId ? Number(activityId) : null,
                      });
                    }}
                    className="mt-6 grid gap-4"
                  >
                    <select
                      value={movementType}
                      onChange={(event) => setMovementType(event.target.value as "ingreso" | "egreso")}
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-[#0F4C81] outline-none"
                    >
                      <option value="egreso">Egreso (-)</option>
                      <option value="ingreso">Ingreso (+)</option>
                    </select>

                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Categoría: Luz, Agua, Alimentación, Mantenimiento..."
                      required
                      className="rounded-xl border-border"
                    />

                    <Input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Fuente: Tesorería JAC, Aportes, Alquiler Salón..."
                      required
                      className="rounded-xl border-border"
                    />

                    <select
                      value={activityId}
                      onChange={(event) => setActivityId(event.target.value)}
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-[#0F4C81] outline-none"
                    >
                      <option value="">Sin actividad relacionada</option>
                      {activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.title}
                        </option>
                      ))}
                    </select>

                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descripción del movimiento financiero"
                      required
                      className="min-h-24 rounded-xl border-border"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder="Valor COP ($)"
                        required
                        className="rounded-xl border-border"
                      />
                      <Input
                        type="date"
                        value={occurredAt}
                        onChange={(e) => setOccurredAt(e.target.value)}
                        required
                        className="rounded-xl border-border"
                      />
                    </div>

                    <Input
                      value={supportUrl}
                      onChange={(e) => setSupportUrl(e.target.value)}
                      placeholder="URL del soporte digital (opcional)"
                      className="rounded-xl border-border"
                    />

                    <SupportFileInput onUploaded={setSupportUrl} />

                    <Button disabled={record.isPending} className="rounded-xl bg-[#1B8A5A] hover:bg-[#166534] text-white font-bold">
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar {movementType === "ingreso" ? "Ingreso" : "Egreso"}
                    </Button>
                  </form>
                ) : (
                  <AccessNote />
                )}
              </CardContent>
            </Card>

            {/* LEDGER & DISTRIBUTION */}
            <div className="grid gap-6">
              {/* BUDGET EXECUTION CARD */}
              <Card className="border-border bg-[#0F4C81] text-white shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <Landmark className="h-6 w-6 text-amber-300" />
                  <p className="mt-4 font-serif text-2xl font-black">Ejecución Presupuestal {selectedPeriod}</p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
                    {approvedBudget
                      ? `Presupuesto aprobado: ${money(approvedBudget)}.`
                      : "Defina el presupuesto aprobado para controlar la meta del periodo."}
                  </p>
                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${Math.min(execution, 100)}%` }} />
                  </div>
                  <p className="mt-3 text-xs font-black uppercase tracking-widest text-amber-300">
                    {execution}% ejecutado · {money(expenses)}
                  </p>

                  {isAuthenticated && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        setBudget.mutate({
                          periodLabel: budgetPeriod,
                          source: budgetSource,
                          approvedAmount: budgetAmount,
                        });
                      }}
                      className="mt-5 grid gap-2 sm:grid-cols-[.7fr_1fr_.75fr_auto]"
                    >
                      <Input
                        value={budgetPeriod}
                        onChange={(e) => setBudgetPeriod(e.target.value)}
                        placeholder="Periodo"
                        required
                        className="h-9 rounded-xl border-white/20 bg-white/10 text-xs text-white placeholder:text-white/60"
                      />
                      <Input
                        value={budgetSource}
                        onChange={(e) => setBudgetSource(e.target.value)}
                        placeholder="Fuente"
                        required
                        className="h-9 rounded-xl border-white/20 bg-white/10 text-xs text-white placeholder:text-white/60"
                      />
                      <Input
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder="Valor COP"
                        required
                        className="h-9 rounded-xl border-white/20 bg-white/10 text-xs text-white placeholder:text-white/60"
                      />
                      <Button size="sm" disabled={setBudget.isPending} className="h-9 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300">
                        Guardar
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* METRIC BARS */}
              <Card className="border-border bg-card shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <p className="font-serif text-xl font-bold text-foreground">Distribución de Gastos</p>
                  <div className="mt-5 grid gap-6 lg:grid-cols-2">
                    <MetricBars title="Egresos por Categoría" values={byCategory} max={maxCategory} format={money} />
                    <MetricBars title="Movimientos por Fuente" values={bySource} max={maxSource} format={money} />
                  </div>
                </CardContent>
              </Card>

              {/* RECENT MOVEMENTS LEDGER TABLE */}
              <Card className="border-border bg-card shadow-sm rounded-2xl">
                <CardContent className="p-0">
                  <div className="border-b border-border p-6">
                    <p className="font-serif text-xl font-bold text-foreground">Libro de Caja Reciente</p>
                    <p className="mt-1 text-xs text-muted-foreground">Movimientos registrados en orden cronológico.</p>
                  </div>

                  {movements.length ? (
                    <div className="divide-y divide-border">
                      {movements.slice(0, 15).map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-muted/40 transition-colors">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold ${
                              item.movementType === "ingreso"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {item.movementType === "ingreso" ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">
                              {item.category} · {item.source}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-extrabold ${item.movementType === "ingreso" ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
                              {item.movementType === "ingreso" ? "+" : "-"}{money(Number(item.amount))}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{new Date(item.occurredAt).toLocaleDateString("es-CO")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid place-items-center px-6 py-14 text-center">
                      <ReceiptText className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">No hay movimientos registrados.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      )}
    </JacShell>
  );
}

function MetricBars({
  title,
  values,
  max,
  format,
}: {
  title: string;
  values: Array<{ label: string; value: number }>;
  max: number;
  format: (value: number) => string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#1B8A5A] dark:text-emerald-400">{title}</p>
      {values.length ? (
        <div className="mt-3 space-y-3">
          {values.slice(0, 6).map((item) => (
            <div key={item.label}>
              <div className="flex justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-foreground">{item.label}</span>
                <span className="shrink-0 text-muted-foreground font-mono">{format(item.value)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0F4C81] to-[#1B8A5A]"
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Sin datos en la vigencia.</p>
      )}
    </div>
  );
}

function FinanceCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "rose" | "amber";
}) {
  const color = {
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  }[tone];

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl">
      <CardContent className="p-5">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-serif text-2xl font-extrabold text-foreground">{value}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function AccessNote() {
  return (
    <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs font-semibold text-amber-800 dark:text-amber-300">
      Inicia sesión con un perfil autorizado (Directiva, Tesorero o Fiscal) para registrar movimientos.
    </div>
  );
}
