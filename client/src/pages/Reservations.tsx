import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  Armchair,
  Calendar as CalendarIcon,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Info,
  PackageCheck,
  Plus,
  Save,
  Settings,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

interface ReservationForm {
  eventName: string;
  startsAt: string;
  endsAt: string;
  applicantType: "afiliado" | "vecino" | "externo";
  amount: string;
}

const defaultForm: ReservationForm = {
  eventName: "",
  startsAt: "",
  endsAt: "",
  applicantType: "afiliado",
  amount: "30000",
};

interface RoomConfig {
  priceAfiliado: number;
  priceVecino: number;
  priceExterno: number;
  availableChairs: number;
  availableTables: number;
  soundEquipment: string;
  maxCapacity: number;
}

const defaultRoomConfig: RoomConfig = {
  priceAfiliado: 30000,
  priceVecino: 60000,
  priceExterno: 120000,
  availableChairs: 150,
  availableTables: 20,
  soundEquipment: "Consola de sonido 8 canales + 2 Bafles 15\" + 2 Micrófonos",
  maxCapacity: 200,
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  solicitada: {
    label: "Solicitada",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: Clock,
  },
  aprobada: {
    label: "Aprobada",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  rechazada: {
    label: "Rechazada",
    color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300 border-gray-200 dark:border-gray-800",
    icon: AlertCircle,
  },
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-CO", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Reservations() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [form, setForm] = useState<ReservationForm>(defaultForm);
  const [roomConfig, setRoomConfig] = useState<RoomConfig>(defaultRoomConfig);

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  const snapshot = trpc.reservations.snapshot.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const create = trpc.reservations.create.useMutation({
    onSuccess: () => {
      setForm(defaultForm);
      setShowForm(false);
      snapshot.refetch();
      toast.success("Solicitud de reserva enviada a la directiva.");
    },
    onError: (err) => toast.error(err.message),
  });

  const reservations = snapshot.data?.reservations ?? [];

  // Recalculate price when applicant type changes
  const handleApplicantTypeChange = (type: "afiliado" | "vecino" | "externo") => {
    let calculatedAmount = roomConfig.priceAfiliado;
    if (type === "vecino") calculatedAmount = roomConfig.priceVecino;
    if (type === "externo") calculatedAmount = roomConfig.priceExterno;

    setForm((prev) => ({
      ...prev,
      applicantType: type,
      amount: String(calculatedAmount),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startsAt || !form.endsAt) {
      toast.error("Selecciona fecha de inicio y fin.");
      return;
    }
    create.mutate({
      eventName: form.eventName,
      startsAt: new Date(form.startsAt),
      endsAt: new Date(form.endsAt),
      applicantType: form.applicantType,
      amount: form.amount,
    });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfig(false);
    toast.success("Configuración e inventario del Salón Comunal actualizados.");
  };

  // Calendar Day Click -> Sets date in form
  const handleSelectCalendarDay = (day: number) => {
    const selected = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day, 10, 0);
    const end = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day, 16, 0);

    const formatISO = (d: Date) => {
      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setForm((prev) => ({
      ...prev,
      startsAt: formatISO(selected),
      endsAt: formatISO(end),
    }));
    setShowForm(true);
    toast.info(`Día ${day} seleccionado. Completa el formulario de reserva.`);
  };

  return (
    <JacShell
      eyebrow="Gestión e Inventario de Espacios"
      title="Reservas & Control Salón Comunal"
      description="Calendario interactivo de disponibilidad, inventario de sillas/mesas, tarifas oficiales y solicitudes de reserva."
    >
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#0F4C81] text-white">
            {reservations.length} Reserva{reservations.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            Aforo Máximo: <strong className="text-foreground">{roomConfig.maxCapacity} personas</strong>
          </span>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <Button
              onClick={() => setShowConfig(!showConfig)}
              variant="outline"
              className="rounded-xl border-border font-bold gap-2"
            >
              <Settings className="h-4 w-4 text-amber-500" />
              Configurar Tarifas e Inventario
            </Button>
          )}
          {isAuthenticated && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-[#1B8A5A] text-white hover:bg-[#166534] font-bold gap-2 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Nueva Reserva
            </Button>
          )}
        </div>
      </div>

      {/* INVENTORY & PRICING SUMMARY BANNER */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <Armchair className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Inventario Sillas</p>
              <p className="text-lg font-black text-foreground">{roomConfig.availableChairs} Sillas Disponibles</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <PackageCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Inventario Mesas</p>
              <p className="text-lg font-black text-foreground">{roomConfig.availableTables} Mesas Comunitarias</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              <DollarSign className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tarifa Afiliados</p>
              <p className="text-lg font-black text-[#1B8A5A] dark:text-emerald-400">
                ${roomConfig.priceAfiliado.toLocaleString("es-CO")} COP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
              <Volume2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Equipo de Sonido</p>
              <p className="text-xs font-bold text-foreground line-clamp-1">{roomConfig.soundEquipment}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADMIN INVENTORY & PRICING CONFIG FORM */}
      {showConfig && isAdmin && (
        <Card className="mb-8 border-amber-300 dark:border-amber-900/60 bg-amber-500/10 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-200 dark:border-amber-900/40 pb-3">
              <Settings className="h-5 w-5 text-amber-600" />
              <h3 className="font-serif text-lg font-black text-amber-950 dark:text-amber-200">
                Configurar Tarifas Oficiales e Inventario del Salón
              </h3>
            </div>

            <form onSubmit={handleSaveConfig} className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs font-bold mb-1 block">Tarifa Afiliado JAC ($)</Label>
                <Input
                  type="number"
                  value={roomConfig.priceAfiliado}
                  onChange={(e) => setRoomConfig({ ...roomConfig, priceAfiliado: Number(e.target.value) })}
                  className="rounded-xl border-amber-300 bg-background font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Tarifa Vecino Barrio ($)</Label>
                <Input
                  type="number"
                  value={roomConfig.priceVecino}
                  onChange={(e) => setRoomConfig({ ...roomConfig, priceVecino: Number(e.target.value) })}
                  className="rounded-xl border-amber-300 bg-background font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Tarifa Externo ($)</Label>
                <Input
                  type="number"
                  value={roomConfig.priceExterno}
                  onChange={(e) => setRoomConfig({ ...roomConfig, priceExterno: Number(e.target.value) })}
                  className="rounded-xl border-amber-300 bg-background font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Sillas Disponibles</Label>
                <Input
                  type="number"
                  value={roomConfig.availableChairs}
                  onChange={(e) => setRoomConfig({ ...roomConfig, availableChairs: Number(e.target.value) })}
                  className="rounded-xl border-amber-300 bg-background font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Mesas Disponibles</Label>
                <Input
                  type="number"
                  value={roomConfig.availableTables}
                  onChange={(e) => setRoomConfig({ ...roomConfig, availableTables: Number(e.target.value) })}
                  className="rounded-xl border-amber-300 bg-background font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Aforo Máximo (Personas)</Label>
                <Input
                  type="number"
                  value={roomConfig.maxCapacity}
                  onChange={(e) => setRoomConfig({ ...roomConfig, maxCapacity: Number(e.target.value) })}
                  className="rounded-xl border-amber-300 bg-background font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <Label className="text-xs font-bold mb-1 block">Descripción Equipo de Sonido</Label>
                <Input
                  value={roomConfig.soundEquipment}
                  onChange={(e) => setRoomConfig({ ...roomConfig, soundEquipment: e.target.value })}
                  className="rounded-xl border-amber-300 bg-background font-bold"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowConfig(false)} className="rounded-xl font-bold">
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* INTERACTIVE MONTHLY DISPONIBILITY CALENDAR GRID */}
      <Card className="mb-8 border-border bg-card shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-[#0F4C81]" />
              <div>
                <h3 className="font-serif text-xl font-extrabold text-foreground">
                  Calendario Interactivo de Disponibilidad
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Haz clic sobre un día disponible (verde) para apartar el salón comunal automáticamente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentCalendarDate(
                    new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1),
                  )
                }
                className="h-8 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-serif font-black text-foreground text-sm uppercase tracking-wider">
                {currentCalendarDate.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentCalendarDate(
                    new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1),
                  )
                }
                className="h-8 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CalendarGrid
            currentDate={currentCalendarDate}
            reservations={reservations}
            onSelectDay={handleSelectCalendarDay}
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-muted-foreground border-t border-border pt-4">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" /> Día Libre / Disponible
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" /> Solicitado / En Revisión
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" /> Reservado / Ocupado
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CREATE FORM */}
      {showForm && (
        <Card className="mb-8 border-[#0F4C81]/30 bg-card shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[#0F4C81]" />
              Solicitud de Reserva de Espacio
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs font-bold mb-1 block">Nombre del Evento / Actividad *</Label>
                <Input
                  type="text"
                  value={form.eventName}
                  onChange={(e) => setForm((prev) => ({ ...prev, eventName: e.target.value }))}
                  className="rounded-xl border-border bg-background"
                  placeholder="Ej: Evento Comunitario / Celebración Familiar"
                  required
                  minLength={5}
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Fecha y Hora Inicio *</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
                  className="rounded-xl border-border bg-background font-medium"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Fecha y Hora Fin *</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))}
                  className="rounded-xl border-border bg-background font-medium"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Tipo de Solicitante *</Label>
                <select
                  value={form.applicantType}
                  onChange={(e) => handleApplicantTypeChange(e.target.value as ReservationForm["applicantType"])}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F4C81]"
                >
                  <option value="afiliado">Afiliado JAC (Tarifa Preferencial: ${roomConfig.priceAfiliado.toLocaleString("es-CO")})</option>
                  <option value="vecino">Vecino del Barrio (${roomConfig.priceVecino.toLocaleString("es-CO")})</option>
                  <option value="externo">Externo (${roomConfig.priceExterno.toLocaleString("es-CO")})</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">Valor Calculado ($COP)</Label>
                <Input
                  type="text"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  className="rounded-xl border-border bg-background font-bold text-[#1B8A5A]"
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={create.isPending}
                  className="rounded-xl bg-[#1B8A5A] text-white hover:bg-[#166534] font-bold px-6"
                >
                  {create.isPending ? "Enviando..." : "Confirmar Solicitud"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl font-bold"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* RESERVATIONS LIST */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reservations.length > 0 ? (
          reservations.map((reservation) => {
            const config = statusConfig[reservation.status] ?? statusConfig.solicitada;
            const StatusIcon = config.icon;
            return (
              <Card
                key={reservation.id}
                className="border-border bg-card shadow-sm rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-foreground text-sm leading-tight line-clamp-2">
                      {reservation.eventName}
                    </h4>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap ${config.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#0F4C81]" />
                      {formatDate(reservation.startsAt)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#1B8A5A]" />
                      {formatDate(reservation.endsAt)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md">
                      {reservation.applicantType}
                    </span>
                    {Number(reservation.amount) > 0 && (
                      <span className="text-xs font-extrabold text-[#1B8A5A] dark:text-emerald-400">
                        ${Number(reservation.amount).toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <CalendarCheck className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              No hay reservas registradas.{" "}
              {isAuthenticated
                ? "Haz clic sobre un día en el calendario para apartar el salón comunal."
                : "Inicia sesión para solicitar una reserva."}
            </p>
          </div>
        )}
      </div>
    </JacShell>
  );
}

function CalendarGrid({
  currentDate,
  reservations,
  onSelectDay,
}: {
  currentDate: Date;
  reservations: any[];
  onSelectDay: (day: number) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const reservedDaysMap = useMemo(() => {
    const map = new Map<number, "solicitada" | "aprobada">();
    reservations.forEach((res) => {
      const d = new Date(res.startsAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        map.set(d.getDate(), res.status === "aprobada" ? "aprobada" : "solicitada");
      }
    });
    return map;
  }, [reservations, year, month]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
        <div>Dom</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12 rounded-xl bg-muted/20 opacity-40" />
        ))}

        {days.map((day) => {
          const status = reservedDaysMap.get(day);
          let colorClass =
            "bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/20";
          if (status === "aprobada") {
            colorClass = "bg-rose-500/20 text-rose-950 dark:text-rose-200 border-rose-400/50 cursor-not-allowed";
          } else if (status === "solicitada") {
            colorClass = "bg-amber-500/20 text-amber-950 dark:text-amber-200 border-amber-400/50";
          }

          return (
            <button
              key={day}
              type="button"
              disabled={status === "aprobada"}
              onClick={() => onSelectDay(day)}
              className={`h-12 rounded-xl border p-1.5 flex flex-col justify-between items-start font-bold transition-all text-xs ${colorClass}`}
            >
              <span>{day}</span>
              <span className="text-[9px] font-black uppercase">
                {status === "aprobada" ? "Ocupado" : status === "solicitada" ? "En Revisión" : "Libre"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
