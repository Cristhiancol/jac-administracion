import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";

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
  amount: "0",
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  solicitada: { label: "Solicitada", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800", icon: Clock },
  aprobada: { label: "Aprobada", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  rechazada: { label: "Rechazada", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800", icon: XCircle },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300 border-gray-200 dark:border-gray-800", icon: AlertCircle },
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
  const [form, setForm] = useState<ReservationForm>(defaultForm);

  const snapshot = trpc.reservations.snapshot.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const create = trpc.reservations.create.useMutation({
    onSuccess: () => {
      setForm(defaultForm);
      setShowForm(false);
      snapshot.refetch();
    },
  });

  const reservations = snapshot.data?.reservations ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      eventName: form.eventName,
      startsAt: new Date(form.startsAt),
      endsAt: new Date(form.endsAt),
      applicantType: form.applicantType,
      amount: form.amount,
    });
  };

  return (
    <JacShell
      eyebrow="Gestión de Espacios Comunitarios"
      title="Reservas Salón Comunal"
      description="Calendario de disponibilidad, solicitudes de reserva y control de eventos en el salón comunal Bellavista."
    >
      {/* Action Bar */}
      {isAuthenticated && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground">
              {reservations.length} reserva{reservations.length !== 1 ? "s" : ""} registrada{reservations.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-[#0F4C81] text-white hover:bg-[#0D3A66] transition-all font-bold gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="mb-6 border-[#0F4C81]/20 bg-card shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[#0F4C81]" />
              Solicitar Reserva
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground mb-1">Nombre del Evento *</label>
                <input
                  type="text"
                  value={form.eventName}
                  onChange={e => setForm(prev => ({ ...prev, eventName: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] outline-none transition"
                  placeholder="Ej: Reunión de comité de deportes"
                  required
                  minLength={5}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Fecha y Hora Inicio *</label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={e => setForm(prev => ({ ...prev, startsAt: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Fecha y Hora Fin *</label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={e => setForm(prev => ({ ...prev, endsAt: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Tipo de Solicitante *</label>
                <select
                  value={form.applicantType}
                  onChange={e => setForm(prev => ({ ...prev, applicantType: e.target.value as ReservationForm["applicantType"] }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] outline-none transition"
                >
                  <option value="afiliado">Afiliado JAC</option>
                  <option value="vecino">Vecino del Barrio</option>
                  <option value="externo">Externo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Valor ($COP)</label>
                <input
                  type="text"
                  value={form.amount}
                  onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] outline-none transition"
                  placeholder="0"
                  pattern="^\d+(\.\d{1,2})?$"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={create.isPending}
                  className="rounded-xl bg-[#1B8A5A] text-white hover:bg-[#166534] font-bold px-6"
                >
                  {create.isPending ? "Enviando..." : "Enviar Solicitud"}
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

      {/* Reservations List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reservations.length > 0 ? (
          reservations.map(reservation => {
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
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${config.color}`}>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {reservation.applicantType}
                    </span>
                    {Number(reservation.amount) > 0 && (
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
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
              No hay reservas registradas. {isAuthenticated ? "Solicita una nueva reserva para el salón comunal." : "Inicia sesión para solicitar una reserva."}
            </p>
          </div>
        )}
      </div>
    </JacShell>
  );
}
