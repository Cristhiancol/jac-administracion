import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { JacShell } from "@/components/jac/JacShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  QrCode, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Plus, 
  Search, 
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function Assemblies() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [view, setView] = useState<"list" | "create" | "attendance">("list");
  const [activeAssemblyId, setActiveAssemblyId] = useState<number | null>(null);

  if (view === "create" && isAdmin) {
    return <CreateAssemblyView onBack={() => setView("list")} />;
  }

  if (view === "attendance" && isAdmin && activeAssemblyId) {
    return (
      <AttendanceView 
        assemblyId={activeAssemblyId} 
        onBack={() => {
          setView("list");
          setActiveAssemblyId(null);
        }} 
      />
    );
  }

  return (
    <JacShell
      eyebrow="Control de Asambleas"
      title="Asambleas Comunitarias"
      description="Registro, asistencia QR y actas digitales de asambleas ordinarias, extraordinarias y comités."
    >
      <div className="space-y-6">
        {isAdmin && (
          <div className="flex justify-end">
            <Button onClick={() => setView("create")} className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold gap-2">
              <Plus className="w-4 h-4" />
              Nueva Asamblea
            </Button>
          </div>
        )}
        <AssembliesList 
          isAdmin={isAdmin} 
          onTakeAttendance={(id) => {
            setActiveAssemblyId(id);
            setView("attendance");
          }} 
        />
      </div>
    </JacShell>
  );
}

function AssembliesList({ isAdmin, onTakeAttendance }: { isAdmin: boolean, onTakeAttendance: (id: number) => void }) {
  const { data: assemblies, isLoading } = trpc.assemblies.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F4C81]" />
      </div>
    );
  }

  if (!assemblies || assemblies.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm rounded-2xl">
        <CardContent className="p-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#0F4C81]/10 text-[#0F4C81] dark:bg-blue-900/30 dark:text-blue-300">
            <Users className="h-8 w-8" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-foreground">No hay asambleas registradas</h3>
          <p className="mt-2 text-sm text-muted-foreground">Las asambleas programadas aparecerán aquí.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assemblies.map((assembly) => (
        <Card key={assembly.id} className="border-border bg-card shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <AssemblyStatusBadge status={assembly.status} />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {assembly.assemblyType.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2 line-clamp-2">
                {assembly.title}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0F4C81] dark:text-blue-400" />
                  <span>{new Date(assembly.scheduledAt).toLocaleDateString('es-CO')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1B8A5A] dark:text-green-400" />
                  <span className="truncate">{assembly.location}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-bold text-foreground">{(assembly as { attendancePercentage?: number }).attendancePercentage ?? 0}%</span>
                  <span className="text-muted-foreground ml-1">asistencia</span>
                </div>
                {isAdmin && (assembly.status === 'programada' || assembly.status === 'en_curso') && (
                  <Button 
                    size="sm" 
                    onClick={() => onTakeAttendance(assembly.id)}
                    className="bg-[#1B8A5A] hover:bg-[#1B8A5A]/90 text-white"
                  >
                    Tomar Asistencia
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AssemblyStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    programada: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    en_curso: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    finalizada: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    cancelada: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
  };
  
  const className = styles[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${className}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function CreateAssemblyView({ onBack }: { onBack: () => void }) {
  const utils = trpc.useUtils();
  const createAssembly = trpc.assemblies.create.useMutation({
    onSuccess: () => {
      toast.success("Asamblea creada exitosamente");
      utils.assemblies.list.invalidate();
      onBack();
    },
    onError: () => {
      toast.error("Error al crear asamblea");
    }
  });

  const [formData, setFormData] = useState({
    title: "",
    type: "ordinaria" as "ordinaria" | "extraordinaria" | "comite",
    date: "",
    location: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAssembly.mutate({
      title: formData.title,
      assemblyType: formData.type,
      scheduledAt: new Date(formData.date),
      location: formData.location || null,
      notes: formData.notes || null,
    });
  };

  return (
    <JacShell
      eyebrow="Nueva Asamblea"
      title="Programar Asamblea"
      description="Define los detalles para la nueva asamblea comunitaria."
    >
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Asamblea</Label>
                <Input 
                  id="title" 
                  required
                  placeholder="Ej: Asamblea General Ordinaria 2026"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tipo de Asamblea</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(v) => setFormData(p => ({ ...p, type: v as "ordinaria" | "extraordinaria" | "comite" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordinaria">Ordinaria</SelectItem>
                      <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                      <SelectItem value="comite">Comité de Trabajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha y Hora</Label>
                  <Input 
                    id="date" 
                    type="datetime-local" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lugar</Label>
                <Input 
                  id="location" 
                  required
                  placeholder="Ej: Salón Comunal Bellavista"
                  value={formData.location}
                  onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas / Orden del día (Opcional)</Label>
                <textarea 
                  id="notes" 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Detalles adicionales..."
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAssembly.isPending} className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold">
                  {createAssembly.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Guardar Asamblea
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </JacShell>
  );
}

function AttendanceView({ assemblyId, onBack }: { assemblyId: number, onBack: () => void }) {
  const { data: attendanceData, isLoading } = trpc.assemblies.attendance.useQuery({ assemblyId });
  const checkIn = trpc.assemblies.checkIn.useMutation();
  const utils = trpc.useUtils();
  const [cedula, setCedula] = useState("");

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim()) return;
    
    checkIn.mutate({ assemblyId, cedula }, {
      onSuccess: () => {
        toast.success("Asistencia registrada");
        setCedula("");
        utils.assemblies.attendance.invalidate({ assemblyId });
      },
      onError: (err) => {
        toast.error(err.message || "Error al registrar asistencia");
      }
    });
  };

  const attendedCount = attendanceData?.filter((a: any) => a.attended).length || 0;
  const totalCount = attendanceData?.length || 0;

  return (
    <JacShell
      eyebrow="Control de Asistencia"
      title="Registro de Asistentes"
      description="Escanea el código QR o ingresa la cédula manualmente."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Volver a asambleas
        </Button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <Card className="border-[#0F4C81]/20 bg-card shadow-lg rounded-3xl overflow-hidden backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
              <CardContent className="p-8">
                <form onSubmit={handleCheckIn} className="space-y-4">
                  <Label htmlFor="cedula" className="text-lg font-bold text-foreground">
                    Registro Rápido
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                      <Input
                        id="cedula"
                        autoFocus
                        placeholder="Escanea QR o ingresa Cédula..."
                        className="pl-14 h-16 text-xl rounded-2xl border-2 border-muted focus-visible:ring-[#0F4C81] focus-visible:border-[#0F4C81] transition-all bg-white dark:bg-slate-950"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        disabled={checkIn.isPending}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={checkIn.isPending || !cedula.trim()} 
                      className="h-16 px-8 rounded-2xl bg-[#1B8A5A] hover:bg-[#1B8A5A]/90 text-white font-bold text-lg shadow-md transition-all"
                    >
                      {checkIn.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Registrar"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardContent className="p-0">
                <div className="p-5 border-b border-border flex justify-between items-center bg-muted/10">
                  <h3 className="font-serif text-lg font-bold">Listado de Afiliados</h3>
                  <span className="text-sm font-bold bg-[#0F4C81]/10 text-[#0F4C81] dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full">
                    {attendedCount} / {totalCount} Asistentes
                  </span>
                </div>
                
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : attendanceData?.length ? (
                    attendanceData.map((record) => (
                      <div key={record.id} className={`flex items-center justify-between p-4 transition-colors ${record.attended ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-muted/30'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            record.attended 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {record.affiliateName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{record.affiliateName}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              C.C. ****{String(record.affiliateCedula).slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div>
                          {record.attended ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
                              <CheckCircle2 className="w-4 h-4" />
                              Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/30">
                              <XCircle className="w-4 h-4" />
                              Ausente
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No se encontraron registros para esta asamblea.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[#0F4C81]/20 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <h4 className="font-serif text-xl font-black text-[#0F4C81] dark:text-blue-400 mb-6">
                  Código de Acceso
                </h4>
                
                <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-lg border-2 border-[#0F4C81] flex flex-col items-center justify-center mb-6 transform transition-transform hover:scale-105">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#0F4C81] to-[#1B8A5A] rounded-lg flex items-center justify-center shadow-inner">
                    <QrCode className="h-20 w-20 text-white drop-shadow-md" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#0F4C81]">Escanear para asistencia</p>
                </div>
                
                <p className="text-sm text-muted-foreground font-medium px-4">
                  Proyecte este código en la entrada para que los afiliados registren su llegada usando la app.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </JacShell>
  );
}
