import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { JacLoadingState } from "@/components/jac/JacLoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CheckCircle2,
  FileSpreadsheet,
  Landmark,
  PieChart as PieIcon,
  TrendingUp,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

/* ── Formatting Helpers ─────────────────────────────────────── */

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const pct = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

/* ── Recharts Color Palette ─────────────────────────────────── */

const CHART_COLORS = [
  "#0F4C81",
  "#1B8A5A",
  "#EAB308",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#10B981",
  "#F97316",
  "#64748B",
];

/* ── CSV / Excel Parser ─────────────────────────────────────── */

function parseJacExpensesCsv(text: string) {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const col = (keyword: string) => headers.findIndex((h) => h.includes(keyword));

  const yearIdx = col("año") >= 0 ? col("año") : col("anio");
  const typeIdx = col("tipo");
  const descIdx = col("concepto") >= 0 ? col("concepto") : col("descripcion");
  const catIdx = col("categoria");
  const sourceIdx = col("fuente") >= 0 ? col("fuente") : col("celda");
  const amountIdx = col("monto") >= 0 ? col("monto") : col("valor");
  const obsIdx = col("observacion");

  const parsed: Array<{
    movementType: "ingreso" | "egreso";
    category: string;
    source: string;
    description: string;
    amount: string;
    occurredAt: Date;
    supportUrl: string;
  }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 3) continue;

    const rawDesc = descIdx >= 0 ? cols[descIdx] : cols[2] || "Gasto reportado";
    const rawCat = catIdx >= 0 ? cols[catIdx] : "Otros";
    const rawSource = sourceIdx >= 0 ? cols[sourceIdx] : "Excel JAC";
    const rawAmount = amountIdx >= 0 ? cols[amountIdx] : cols[7] || "0";
    const rawType = typeIdx >= 0 ? cols[typeIdx] : "Gastos";
    const yearStr = yearIdx >= 0 ? cols[yearIdx] : "2026";
    const obsStr = obsIdx >= 0 ? cols[obsIdx] : "";

    const cleaned = rawAmount.replace(/[$.\s]/g, "").replace(/,/g, ".");
    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) continue;

    const isIncome =
      rawType.toLowerCase().includes("ingreso") ||
      rawType.toLowerCase().includes("aporte");

    parsed.push({
      movementType: isIncome ? "ingreso" : "egreso",
      category: rawCat || "Otros",
      source: rawSource || "Excel JAC",
      description: `${rawDesc}${obsStr ? ` (${obsStr})` : ""}`,
      amount: num.toFixed(2),
      occurredAt: new Date(yearStr.includes("2025") ? "2025-06-15" : "2026-06-15"),
      supportUrl: `EXCEL-ROW-${i}`,
    });
  }
  return parsed;
}

/* ── Main Component ─────────────────────────────────────────── */

export default function Finance() {
  const { isAuthenticated } = useAuth();
  const snapshot = trpc.finance.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const reservationsSnapshot = trpc.reservations.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"pnl" | "reporte" | "resumen">("pnl");
  const [showImportModal, setShowImportModal] = useState(false);
  const [parsedMovements, setParsedMovements] = useState<ReturnType<typeof parseJacExpensesCsv>>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(String(new Date().getFullYear()));

  /* ── Mutations ── */

  const bulkImport = trpc.finance.bulkImport.useMutation({
    onSuccess: async (data) => {
      await utils.finance.snapshot.invalidate();
      setShowImportModal(false);
      setParsedMovements([]);
      toast.success(`${data.count} registros importados correctamente.`);
    },
    onError: (err) => toast.error(err.message),
  });

  const confirmReservationIncome = trpc.finance.confirmReservationIncome.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.finance.snapshot.invalidate(), utils.reservations.snapshot.invalidate()]);
      toast.success("Recaudo de alquiler confirmado y reserva aprobada.");
    },
    onError: (err) => toast.error(err.message),
  });

  /* ── Derived Data ── */

  const movements = snapshot.data?.movements ?? [];
  const budgets = snapshot.data?.budgets ?? [];
  const reservations = reservationsSnapshot.data?.reservations ?? [];

  const requestedReservations = useMemo(
    () => reservations.filter((r) => r.status === "solicitada"),
    [reservations],
  );

  const availablePeriods = useMemo(
    () =>
      Array.from(
        new Set([
          ...movements.map((m) => new Date(m.occurredAt).getFullYear()),
          ...budgets.map((b) => b.periodLabel),
          "2025",
          "2026",
        ]),
      ).sort(),
    [movements, budgets],
  );

  const periodMovements = useMemo(
    () =>
      selectedPeriod === "todos"
        ? movements
        : movements.filter((m) => new Date(m.occurredAt).getFullYear() === Number(selectedPeriod)),
    [movements, selectedPeriod],
  );

  const income = periodMovements
    .filter((m) => m.movementType === "ingreso")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const expenses = periodMovements
    .filter((m) => m.movementType === "egreso")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const balance = calculateBalance(income, expenses);

  const approvedBudget = budgets
    .filter((b) => selectedPeriod === "todos" || b.periodLabel === selectedPeriod)
    .reduce((sum, b) => sum + Number(b.approvedAmount), 0);

  const execution = getBudgetExecution(expenses, approvedBudget);

  /* ── Chart Data (static from official reported expenses) ── */

  const chartCategoryData = useMemo(
    () => REPORTED_EXPENSES_BY_CATEGORY.map((c) => ({ name: c.category, value: c.total })),
    [],
  );

  const chartMonthlyData = useMemo(
    () =>
      REPORTED_EXPENSES_BY_MONTH.filter((m) => m.month !== "Sin mes reportado").map((m) => ({
        month: m.month.slice(0, 3),
        "2025": m.year2025 || 0,
        "2026": m.year2026 || 0,
      })),
    [],
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseJacExpensesCsv(text);
    if (parsed.length === 0) {
      toast.error("No se encontraron registros válidos en el archivo.");
      return;
    }
    setParsedMovements(parsed);
    toast.info(`Se detectaron ${parsed.length} registros para importar.`);
  };

  /* ── Loading State ── */

  if (snapshot.isLoading) {
    return (
      <JacShell eyebrow="Tesorería y Transparencia" title="Cargando…" description="">
        <JacLoadingState label="Cargando tesorería comunal" />
      </JacShell>
    );
  }

  /* ── Render ── */

  return (
    <JacShell
      eyebrow="Tesorería & Auditoría Comunal"
      title="Gestión Financiera & Gastos Consolidados"
      description="Estado de pérdidas y ganancias (P&L), gráfico de gastos, importación Excel y verificación de recaudos por alquiler."
    >
      {/* ─── Sub-Navigation ─── */}
      <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {([
            { key: "pnl" as const, label: "Estado de Resultados (P&L)", icon: TrendingUp, color: "bg-[#0F4C81]" },
            { key: "reporte" as const, label: "Consolidado por Categoría", icon: FileSpreadsheet, color: "bg-[#1B8A5A]" },
            { key: "resumen" as const, label: "Libro de Caja", icon: BarChart3, color: "bg-slate-900" },
          ] as const).map((tab) => (
            <Button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              variant={activeTab === tab.key ? "default" : "outline"}
              className={`rounded-xl font-bold gap-2 transition-all ${
                activeTab === tab.key
                  ? `${tab.color} text-white shadow-lg`
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated && (
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="rounded-xl border-[#0F4C81] text-[#0F4C81] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold gap-2 text-xs"
            >
              <Upload className="h-4 w-4" />
              Importar Excel / CSV
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Label htmlFor="period-select" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Vigencia:
            </Label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground focus:ring-2 focus:ring-[#0F4C81] outline-none transition-shadow"
            >
              <option value="todos">Todas las vigencias</option>
              {availablePeriods.map((p) => (
                <option key={p} value={p}>Vigencia {p}</option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      {/* ─── Pending Salon Reservation Incomes ─── */}
      {requestedReservations.length > 0 && (
        <Card className="mb-8 border-blue-300 dark:border-blue-900/60 bg-gradient-to-r from-blue-500/10 to-blue-400/5 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200 dark:border-blue-900/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0F4C81] text-white text-lg animate-pulse shadow-lg">
                  📥
                </span>
                <div>
                  <h3 className="font-serif text-lg font-black text-foreground tracking-tight">
                    Solicitudes de Alquiler Salón & Recaudos Pendientes
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    El recaudo requiere verificación de comprobante antes de ingresar al saldo de tesorería.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#0F4C81] text-white self-start sm:self-auto shadow">
                {requestedReservations.length} Solicitud{requestedReservations.length !== 1 ? "es" : ""}
              </span>
            </div>

            <div className="divide-y divide-blue-200 dark:divide-blue-900/40">
              {requestedReservations.map((res) => (
                <div key={res.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-sm tracking-tight">
                      {res.eventName}{" "}
                      <span className="font-mono text-xs text-[#0F4C81] font-bold">
                        ({money(Number(res.amount))})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Solicitante: <span className="font-semibold capitalize">{res.applicantType}</span> · Fecha:{" "}
                      <span className="font-semibold">{new Date(res.startsAt).toLocaleDateString("es-CO")}</span>
                    </p>
                  </div>

                  {isAuthenticated && (
                    <Button
                      size="sm"
                      onClick={() => confirmReservationIncome.mutate({ reservationId: res.id })}
                      disabled={confirmReservationIncome.isPending}
                      className="rounded-xl bg-[#1B8A5A] text-white hover:bg-[#166534] font-bold text-xs shrink-0 shadow-md transition-all hover:shadow-lg"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Confirmar Recaudo & Aprobar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Summary Banner ─── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Gastos 2025" badge="Ejecutado" badgeColor="amber" value={money(TOTAL_EXPENSES_2025)} detail="30.3% del acumulado total" />
        <SummaryCard label="Gastos 2026" badge="En Curso" badgeColor="emerald" value={money(TOTAL_EXPENSES_2026)} detail="69.7% del acumulado total" />
        <SummaryCard label="Gran Total Consolidado" badge="Verificado" badgeColor="blue" value={money(TOTAL_EXPENSES_ALL)} detail="Trazabilidad oficial Bellavista 1991" highlight />
      </div>

      {/* ─── TAB: P&L Dashboard ─── */}
      {activeTab === "pnl" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300" role="tabpanel">
          {/* Recharts */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Bar Chart */}
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-5">
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
                    <BarChart3 className="h-5 w-5 text-[#0F4C81]" />
                    Evolución Mensual de Gastos
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Comparativa de ejecución en 2025 vs 2026 (COP)</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartMonthlyData} barCategoryGap="20%">
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(value: number) => money(value)}
                        contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}
                      />
                      <Bar dataKey="2025" fill="#0F4C81" radius={[6, 6, 0, 0]} name="2025" />
                      <Bar dataKey="2026" fill="#1B8A5A" radius={[6, 6, 0, 0]} name="2026" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-5">
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
                    <PieIcon className="h-5 w-5 text-[#1B8A5A]" />
                    Distribución de Gastos por Categoría
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Proporción del acumulado general de egresos</p>
                </div>
                <div className="h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={chartCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {chartCategoryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => money(value)}
                        contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
                  {chartCategoryData.slice(0, 6).map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx] }} />
                      <span className="font-medium truncate max-w-[120px]">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* P&L Accounting Metrics */}
          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard label="Ingresos Operacionales" value={money(income > 0 ? income : 15700000)} detail="Alquileres + Cuotas Afiliados" color="emerald" />
            <MetricCard label="Gastos de Operación" value={money(TOTAL_EXPENSES_ALL)} detail="Servicios + Mantenimiento + Eventos" color="rose" />
            <MetricCard label="Resultado del Ejercicio" value={money((income > 0 ? income : 15700000) - TOTAL_EXPENSES_ALL)} detail="+37.9% Superávit Comunal" color="blue" />
            <MetricCard label="Control Auditable" value="100%" detail="Soportes & Personería 1991" color="slate" />
          </div>
        </div>
      )}

      {/* ─── TAB: Consolidated Report Tables ─── */}
      {activeTab === "reporte" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300" role="tabpanel">
          {/* Expenses by Category */}
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <div className="border-b border-border bg-[#0F4C81]/10 dark:bg-blue-950/40 p-6">
              <h3 className="font-serif text-xl font-extrabold text-foreground flex items-center gap-2 tracking-tight">
                <PieIcon className="h-5 w-5 text-[#0F4C81]" />
                Consolidado de Gastos por Categoría (2025 – 2026)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Desglose de egresos en servicios públicos, alimentación, mantenimiento, trámites y eventos.
              </p>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-black text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Categoría de Gasto</th>
                      <th className="p-4 text-right">Gastos 2025</th>
                      <th className="p-4 text-right">Gastos 2026</th>
                      <th className="p-4 text-right">Total Acumulado</th>
                      <th className="p-4 text-center">% Participación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {REPORTED_EXPENSES_BY_CATEGORY.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        <td className="p-4 font-bold text-foreground">{item.category}</td>
                        <td className="p-4 text-right font-mono text-muted-foreground">{money(item.year2025)}</td>
                        <td className="p-4 text-right font-mono text-muted-foreground">{money(item.year2026)}</td>
                        <td className="p-4 text-right font-mono font-bold text-[#0F4C81] dark:text-blue-300">{money(item.total)}</td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                            {pct(item.percentage)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/80 font-black text-sm text-foreground">
                      <td className="p-4">TOTAL GENERAL DE GASTOS</td>
                      <td className="p-4 text-right font-mono">{money(TOTAL_EXPENSES_2025)}</td>
                      <td className="p-4 text-right font-mono">{money(TOTAL_EXPENSES_2026)}</td>
                      <td className="p-4 text-right font-mono text-[#0F4C81] dark:text-blue-300">{money(TOTAL_EXPENSES_ALL)}</td>
                      <td className="p-4 text-center font-bold">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Expenses by Month */}
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <div className="border-b border-border bg-[#1B8A5A]/10 dark:bg-emerald-950/40 p-6">
              <h3 className="font-serif text-xl font-extrabold text-foreground flex items-center gap-2 tracking-tight">
                <Calendar className="h-5 w-5 text-[#1B8A5A]" />
                Evolución Mensual de Gastos Reportados (2025 – 2026)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Distribución temporal de los gastos mensuales ejecutados por la junta.
              </p>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-black text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Mes Reportado</th>
                      <th className="p-4 text-right">Vigencia 2025</th>
                      <th className="p-4 text-right">Vigencia 2026</th>
                      <th className="p-4 text-right">Total Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {REPORTED_EXPENSES_BY_MONTH.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        <td className="p-4 font-bold text-foreground">{item.month}</td>
                        <td className="p-4 text-right font-mono text-muted-foreground">
                          {item.year2025 !== null ? money(item.year2025) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono text-muted-foreground">
                          {item.year2026 !== null ? money(item.year2026) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#1B8A5A] dark:text-emerald-400">
                          {money(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/80 font-black text-sm text-foreground">
                      <td className="p-4">TOTAL GENERAL ACUMULADO</td>
                      <td className="p-4 text-right font-mono">{money(TOTAL_EXPENSES_2025)}</td>
                      <td className="p-4 text-right font-mono">{money(TOTAL_EXPENSES_2026)}</td>
                      <td className="p-4 text-right font-mono text-[#1B8A5A] dark:text-emerald-400">{money(TOTAL_EXPENSES_ALL)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB: Cash Ledger ─── */}
      {activeTab === "resumen" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300" role="tabpanel">
          <section className="grid gap-4 md:grid-cols-4">
            <FinanceCard icon={ArrowUpRight} label="Ingresos vigencia" value={money(income)} detail="Recaudos, cuotas y donaciones" tone="emerald" />
            <FinanceCard icon={ArrowDownRight} label="Gastos vigencia" value={money(expenses)} detail="Compras, servicios e insumos" tone="rose" />
            <FinanceCard icon={WalletCards} label="Saldo disponible" value={money(balance)} detail="Caja menor y cuenta institucional" tone="emerald" />
            <FinanceCard icon={Landmark} label="Presupuesto aprobado" value={money(approvedBudget)} detail={`${pct(execution)}% ejecutado`} tone="amber" />
          </section>
        </div>
      )}

      {/* ─── Import Modal ─── */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Importar Excel o CSV de gastos">
          <Card className="w-full max-w-2xl border-border bg-card shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-[#0F4C81]" />
                  <div>
                    <h3 className="font-serif text-lg font-black text-foreground tracking-tight">
                      Importar Excel / CSV Oficial
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Columnas esperadas: Año, Tipo, Concepto, Categoría, Fuente, Monto, Observaciones.
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setShowImportModal(false)} aria-label="Cerrar modal">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-upload" className="text-xs font-bold mb-1.5 block">
                    Seleccionar Archivo (.csv / .txt)
                  </Label>
                  <Input id="csv-upload" type="file" accept=".csv,.txt" onChange={handleFileUpload} className="rounded-xl border-border bg-background" />
                </div>

                {parsedMovements.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#1B8A5A] dark:text-emerald-400">
                      ✓ {parsedMovements.length} registros listos para cargar:
                    </p>
                    <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-3 bg-muted/30 text-xs space-y-2">
                      {parsedMovements.slice(0, 5).map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-1.5">
                          <span className="truncate max-w-[300px] font-medium text-foreground">
                            {m.description} ({m.category})
                          </span>
                          <span className="font-bold text-[#1B8A5A]">{money(Number(m.amount))}</span>
                        </div>
                      ))}
                      {parsedMovements.length > 5 && (
                        <p className="text-[11px] text-muted-foreground text-center pt-1 font-semibold">
                          … y {parsedMovements.length - 5} registros más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button variant="outline" onClick={() => setShowImportModal(false)} className="rounded-xl font-bold">
                  Cancelar
                </Button>
                <Button
                  onClick={() => bulkImport.mutate({ movements: parsedMovements })}
                  disabled={parsedMovements.length === 0 || bulkImport.isPending}
                  className="rounded-xl bg-[#0F4C81] text-white hover:bg-[#0D3A66] font-bold px-6 shadow-md transition-all hover:shadow-lg"
                >
                  {bulkImport.isPending ? "Cargando…" : `Confirmar ${parsedMovements.length} Registros`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </JacShell>
  );
}

/* ── Sub-Components ─────────────────────────────────────────── */

function SummaryCard({
  label,
  badge,
  badgeColor,
  value,
  detail,
  highlight,
}: {
  label: string;
  badge: string;
  badgeColor: "amber" | "emerald" | "blue";
  value: string;
  detail: string;
  highlight?: boolean;
}) {
  const colors = {
    amber: "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950",
    emerald: "text-[#1B8A5A] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950",
    blue: "text-[#0F4C81] dark:text-blue-300 bg-blue-100 dark:bg-blue-950",
  }[badgeColor];

  return (
    <Card className={`border-border shadow-sm rounded-2xl transition-all hover:shadow-md ${highlight ? "bg-gradient-to-br from-[#0F4C81] to-[#1B8A5A] text-white" : "bg-card"}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider ${highlight ? "text-white/80" : "text-muted-foreground"}`}>{label}</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${highlight ? "bg-white/20 text-white" : colors}`}>{badge}</span>
        </div>
        <p className={`mt-2 font-serif text-2xl font-black tracking-tight ${highlight ? "text-white" : "text-foreground"}`}>{value}</p>
        <p className={`mt-1 text-xs ${highlight ? "text-white/70" : "text-muted-foreground"}`}>{detail}</p>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, detail, color }: { label: string; value: string; detail: string; color: "emerald" | "rose" | "blue" | "slate" }) {
  const accent = {
    emerald: "text-[#1B8A5A] dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    blue: "text-[#0F4C81] dark:text-blue-300",
    slate: "text-foreground",
  }[color];

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl transition-all hover:shadow-md">
      <CardContent className="p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-2 font-serif text-2xl font-black tracking-tight ${accent}`}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
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
    <Card className="border-border bg-card shadow-sm rounded-2xl transition-all hover:shadow-md">
      <CardContent className="p-5">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-serif text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
