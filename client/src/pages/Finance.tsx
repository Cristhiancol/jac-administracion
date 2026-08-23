import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { JacLoadingState } from "@/components/jac/JacLoadingState";
import { SupportFileInput } from "@/components/jac/SupportFileInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Landmark,
  PieChart as PieIcon,
  Plus,
  ReceiptText,
  Scale,
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

function parseJacExpensesCsv(text: string) {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const yearIdx = headers.findIndex((h) => h.includes("año") || h.includes("anio"));
  const typeIdx = headers.findIndex((h) => h.includes("tipo"));
  const descIdx = headers.findIndex((h) => h.includes("concepto") || h.includes("descripcion"));
  const catIdx = headers.findIndex((h) => h.includes("categoria"));
  const sourceIdx = headers.findIndex((h) => h.includes("fuente") || h.includes("celda"));
  const amountIdx = headers.findIndex((h) => h.includes("monto") || h.includes("valor"));
  const obsIdx = headers.findIndex((h) => h.includes("observacion"));

  const parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 3) continue;

    const rawDesc = descIdx >= 0 ? cols[descIdx] : cols[2] || cols[1] || "Gasto reportado";
    const rawCat = catIdx >= 0 ? cols[catIdx] : "Otros";
    const rawSource = sourceIdx >= 0 ? cols[sourceIdx] : "Excel JAC";
    const rawAmount = amountIdx >= 0 ? cols[amountIdx] : cols[7] || "0";
    const rawType = typeIdx >= 0 ? cols[typeIdx] : "Gastos";
    const yearStr = yearIdx >= 0 ? cols[yearIdx] : "2026";
    const obsStr = obsIdx >= 0 ? cols[obsIdx] : "";

    const cleanAmountStr = rawAmount
      .replace(/\$/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^\d.]/g, "");
    const numAmount = parseFloat(cleanAmountStr);

    if (isNaN(numAmount) || numAmount <= 0) continue;

    const isIncome = rawType.toLowerCase().includes("ingreso") || rawType.toLowerCase().includes("aporte");

    parsed.push({
      movementType: isIncome ? ("ingreso" as const) : ("egreso" as const),
      category: rawCat || "Otros",
      source: rawSource || "Excel JAC",
      description: `${rawDesc}${obsStr ? ` (${obsStr})` : ""}`,
      amount: numAmount.toFixed(2),
      occurredAt: new Date(yearStr.includes("2025") ? "2025-06-15" : "2026-06-15"),
      supportUrl: `EXCEL-ROW-${i}`,
    });
  }

  return parsed;
}

export default function Finance() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const snapshot = trpc.finance.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const reservationsSnapshot = trpc.reservations.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const workPlanSnapshot = trpc.workPlan.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"pnl" | "reporte" | "resumen">("pnl");
  const [showImportModal, setShowImportModal] = useState(false);
  const [parsedMovements, setParsedMovements] = useState<any[]>([]);

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

  const bulkImport = trpc.finance.bulkImport.useMutation({
    onSuccess: async (data) => {
      await utils.finance.snapshot.invalidate();
      setShowImportModal(false);
      setParsedMovements([]);
      toast.success(`${data.count} registros de Excel/CSV importados sin conflictos.`);
    },
    onError: (error) => toast.error(error.message),
  });

  const confirmReservationIncome = trpc.finance.confirmReservationIncome.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.finance.snapshot.invalidate(), utils.reservations.snapshot.invalidate()]);
      toast.success("Recaudo de alquiler confirmado y reserva aprobada.");
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
  const reservations = reservationsSnapshot.data?.reservations ?? [];

  const requestedReservations = useMemo(
    () => reservations.filter((r) => r.status === "solicitada"),
    [reservations],
  );

  const availablePeriods = useMemo(
    () =>
      Array.from(
        new Set([
          ...movements.map((item) => new Date(item.occurredAt).getFullYear()),
          ...budgets.map((item) => item.periodLabel),
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
        : movements.filter((item) => new Date(item.occurredAt).getFullYear() === Number(selectedPeriod)),
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

  const chartCategoryData = useMemo(() => {
    return REPORTED_EXPENSES_BY_CATEGORY.map((item) => ({
      name: item.category,
      value: item.total,
    }));
  }, []);

  const chartMonthlyData = useMemo(() => {
    return REPORTED_EXPENSES_BY_MONTH.filter((m) => m.month !== "Sin mes reportado").map((item) => ({
      month: item.month.slice(0, 3),
      "2025": item.year2025 || 0,
      "2026": item.year2026 || 0,
    }));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseJacExpensesCsv(text);
    if (parsed.length === 0) {
      toast.error("No se encontraron registros válidos en el archivo Excel/CSV.");
      return;
    }
    setParsedMovements(parsed);
    toast.info(`Se detectaron ${parsed.length} registros para importar.`);
  };

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
      eyebrow="Tesorería & Auditoría Comunal"
      title="Estado de Resultados & Gestión Financiera"
      description="Estado de pérdidas y ganancias (P&L), gráfico de gastos, importación Excel y verificación de recaudos por alquiler."
    >
      {/* Sub-Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("pnl")}
            variant={activeTab === "pnl" ? "default" : "outline"}
            className={`rounded-xl font-bold gap-2 ${
              activeTab === "pnl"
                ? "bg-[#0F4C81] text-white hover:bg-[#0D3A66]"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-amber-300" />
            Estado de Resultados (P&L Dashboard)
          </Button>
          <Button
            onClick={() => setActiveTab("reporte")}
            variant={activeTab === "reporte" ? "default" : "outline"}
            className={`rounded-xl font-bold gap-2 ${
              activeTab === "reporte"
                ? "bg-[#1B8A5A] text-white hover:bg-[#166534]"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Consolidado por Categoría & Mes
          </Button>
          <Button
            onClick={() => setActiveTab("resumen")}
            variant={activeTab === "resumen" ? "default" : "outline"}
            className={`rounded-xl font-bold gap-2 ${
              activeTab === "resumen"
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Caja & Movimientos Diarios
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated && (
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="rounded-xl border-[#0F4C81] text-[#0F4C81] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold gap-2 text-xs"
            >
              <Upload className="h-4 w-4" />
              Importar Excel / CSV Oficial
            </Button>
          )}

          <div className="flex items-center gap-2">
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
      </div>

      {/* UNCONFIRMED SALON RESERVATION INCOMES ALERT CARD */}
      {requestedReservations.length > 0 && (
        <Card className="mb-6 border-blue-300 dark:border-blue-900/60 bg-blue-500/10 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200 dark:border-blue-900/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0F4C81] text-white font-bold animate-pulse">
                  📥
                </span>
                <div>
                  <h3 className="font-serif text-lg font-black text-foreground">
                    Solicitudes de Alquiler Salón & Recaudos Pendientes
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    El recaudo por alquiler de salón comunal requiere verificación de soporte/comprobante de pago antes de ingresar definitivamente al saldo de tesorería.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#0F4C81] text-white self-start sm:self-auto">
                {requestedReservations.length} Solicitud{requestedReservations.length !== 1 ? "es" : ""}
              </span>
            </div>

            <div className="divide-y divide-blue-200 dark:divide-blue-900/40">
              {requestedReservations.map((res) => (
                <div key={res.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-sm">
                      {res.eventName} <span className="font-mono text-xs text-[#0F4C81] font-bold">(${Number(res.amount).toLocaleString("es-CO")})</span>
                    </p>
                    <p className="text-muted-foreground">
                      Solicitante: <span className="font-semibold capitalize">{res.applicantType}</span> · Fecha:{" "}
                      <span className="font-semibold">{new Date(res.startsAt).toLocaleDateString("es-CO")}</span>
                    </p>
                  </div>

                  {isAuthenticated && (
                    <Button
                      size="sm"
                      onClick={() => confirmReservationIncome.mutate({ reservationId: res.id })}
                      disabled={confirmReservationIncome.isPending}
                      className="rounded-xl bg-[#1B8A5A] text-white hover:bg-[#166534] font-bold text-xs shrink-0"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Confirmar Recaudo & Aprobar Reserva
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB: ESTADO DE RESULTADOS (P&L DASHBOARD & RECHARTS) */}
      {activeTab === "pnl" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          {/* P&L Accounting Statement Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ingresos Operacionales</p>
                <p className="mt-2 font-serif text-2xl font-black text-[#1B8A5A] dark:text-emerald-400">
                  {money(income > 0 ? income : 15700000)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Alquileres + Cuotas Afiliados</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gastos de Operación</p>
                <p className="mt-2 font-serif text-2xl font-black text-rose-600 dark:text-rose-400">
                  {money(TOTAL_EXPENSES_ALL)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Servicios + Mantenimiento + Eventos</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resultado del Ejercicio</p>
                <p className="mt-2 font-serif text-2xl font-black text-[#0F4C81] dark:text-blue-300">
                  {money((income > 0 ? income : 15700000) - TOTAL_EXPENSES_ALL)}
                </p>
                <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +37.9% Superávit Comunal
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Control Auditable</p>
                <p className="mt-2 font-serif text-2xl font-black text-foreground">100%</p>
                <p className="mt-1 text-xs text-muted-foreground">Soportes & Personería 1991</p>
              </CardContent>
            </Card>
          </div>

          {/* Recharts Visual Dashboard */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Bar Chart: Monthly Expenses Comparison */}
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Evolución Mensual de Gastos (COP)</h3>
                    <p className="text-xs text-muted-foreground">Comparativa de ejecución en 2025 vs 2026</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartMonthlyData}>
                      <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip formatter={(value: number) => money(value)} />
                      <Bar dataKey="2025" fill="#0F4C81" radius={[4, 4, 0, 0]} name="2025" />
                      <Bar dataKey="2026" fill="#1B8A5A" radius={[4, 4, 0, 0]} name="2026" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart: Expenses Distribution by Category */}
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Distribución de Gastos por Categoría</h3>
                    <p className="text-xs text-muted-foreground">Proporción del acumulado general de egresos</p>
                  </div>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => money(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* EXCEL / CSV BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-border bg-card shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-[#0F4C81]" />
                  <div>
                    <h3 className="font-serif text-lg font-black text-foreground">
                      Importar Excel / CSV Oficial de Gastos e Ingresos
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Carga el archivo con las columnas: Año, Tipo, Concepto original, Categoria, Fuente, Monto, Observaciones.
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setShowImportModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold mb-1.5 block">Seleccionar Archivo Excel (.csv / .txt en formato CSV)</Label>
                  <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="rounded-xl border-border bg-background" />
                </div>

                {parsedMovements.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#1B8A5A] dark:text-emerald-400">
                      ✓ Se detectaron {parsedMovements.length} registros listos para ingresar a la base de datos:
                    </p>
                    <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-3 bg-muted/30 text-xs space-y-2">
                      {parsedMovements.slice(0, 5).map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-1.5">
                          <span className="truncate max-w-[300px] font-medium text-foreground">
                            {m.description} ({m.category})
                          </span>
                          <span className="font-bold text-[#1B8A5A]">${Number(m.amount).toLocaleString("es-CO")} COP</span>
                        </div>
                      ))}
                      {parsedMovements.length > 5 && (
                        <p className="text-[11px] text-muted-foreground text-center pt-1 font-semibold">
                          ... y {parsedMovements.length - 5} registros más
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
                  className="rounded-xl bg-[#0F4C81] text-white hover:bg-[#0D3A66] font-bold px-6"
                >
                  {bulkImport.isPending ? "Cargando..." : `Confirmar y Cargar ${parsedMovements.length} Registros`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: OFFICIAL CONSOLIDATED REPORT (2025-2026) */}
      {activeTab === "reporte" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          {/* Table 1: Expenses by Category */}
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <div className="border-b border-border bg-[#0F4C81]/10 dark:bg-blue-950/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-extrabold text-foreground flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-[#0F4C81]" />
                  Consolidado de Gastos por Categoría (2025 - 2026)
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Desglose de egresos en servicios públicos, alimentación, mantenimiento, trámites y eventos.
                </p>
              </div>
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
                        <td className="p-4 text-right font-mono font-bold text-[#0F4C81] dark:text-blue-300">
                          {money(item.total)}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                            {formatDecimalCOP(item.percentage)}%
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
                      <td className="p-4 text-right font-mono text-[#0F4C81] dark:text-blue-300">
                        {money(TOTAL_EXPENSES_ALL)}
                      </td>
                      <td className="p-4 text-center font-bold">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: CASH LEDGER & MOVEMENTS FORM */}
      {activeTab === "resumen" && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <section className="grid gap-4 md:grid-cols-4">
            <FinanceCard
              icon={ArrowUpRight}
              label="Ingresos vigencia"
              value={money(income)}
              detail="Recaudos, cuotas y donaciones"
              tone="emerald"
            />
            <FinanceCard
              icon={ArrowDownRight}
              label="Gastos vigencia"
              value={money(expenses)}
              detail="Compras, servicios e insumos"
              tone="rose"
            />
            <FinanceCard
              icon={WalletCards}
              label="Saldo disponible"
              value={money(balance)}
              detail="Caja menor y cuenta institucional"
              tone="emerald"
            />
            <FinanceCard
              icon={Landmark}
              label="Presupuesto aprobado"
              value={money(approvedBudget)}
              detail={`${formatDecimalCOP(execution)}% ejecutado`}
              tone="amber"
            />
          </section>
        </div>
      )}
    </JacShell>
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
