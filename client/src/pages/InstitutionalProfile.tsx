import { useAuth } from "@/_core/hooks/useAuth";
import { InstitutionalMap } from "@/components/jac/InstitutionalMap";
import { JacShell } from "@/components/jac/JacShell";
import { StatusBadge } from "@/components/jac/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BadgeInfo, FileCheck2, Save, ShieldCheck, QrCode, Award, Users, Crown, ShieldAlert, FileText, CheckCircle2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JacLogo } from "@/components/JacLogo";

type FormState = {
  legalName: string;
  nit: string;
  legalRecognition: string;
  communityCode: string;
  officialAddress: string;
  neighborhood: string;
  locality: string;
  latitude: string;
  longitude: string;
  mapEmbedUrl: string;
  verificationStatus: "pendiente" | "verificado" | "observado";
  verificationSourceUrl: string;
  verificationNotes: string;
};

const confirmedMapEmbed =
  "https://www.google.com/maps/embed?pb=!3m2!1ses!2sco!4v1787501743813!5m2!1ses!2sco!6m8!1m7!1s2mhgrDGW0URhOHVuphIrMQ!2m2!1d4.504752602911481!2d-74.1068319118239!3f262.74644463319964!4f1.2480677932996969!5f0.7820865974627469";

const defaultForm: FormState = {
  legalName: "Junta de Acción Comunal Barrio Bellavista (1991) / Localidad de Usme",
  nit: "830.061.828-3",
  legalRecognition: "Personería Jurídica N.º 0837 del 15 de marzo de 1991",
  communityCode: "5084",
  officialAddress: "Carrera 54D # 167B-11, Usme, Bogotá D.C.",
  neighborhood: "Bellavista",
  locality: "Usme",
  latitude: "4.5047526",
  longitude: "-74.1068319",
  mapEmbedUrl: confirmedMapEmbed,
  verificationStatus: "verificado",
  verificationSourceUrl: "https://maps.app.goo.gl/b5LqTjjUv18QpFnY6",
  verificationNotes: "Ficha legal e identidad de la JAC Bellavista 1991 verificada por la Directiva Comunal.",
};

const JAC_ROLE_LABELS: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  directiva: { label: "Directiva / Presidencia", icon: Crown, color: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300" },
  tesorero_fiscal: { label: "Tesorería & Fiscalía", icon: ShieldAlert, color: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300" },
  secretario: { label: "Secretaría General", icon: FileText, color: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300" },
  coordinador_comite: { label: "Coordinación de Comité", icon: UserCheck, color: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300" },
  afiliado: { label: "Afiliado General", icon: Users, color: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300" },
};

export default function InstitutionalProfile() {
  const { isAuthenticated, user } = useAuth();
  const profileQuery = trpc.institutional.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const utils = trpc.useUtils();
  const [form, setForm] = useState<FormState>(defaultForm);
  const save = trpc.institutional.save.useMutation({
    onSuccess: async () => {
      await utils.institutional.get.invalidate();
      toast.success("Ficha institucional de la JAC Bellavista 1991 actualizada.");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setForm({
      legalName: profile.legalName || defaultForm.legalName,
      nit: profile.nit ?? defaultForm.nit,
      legalRecognition: profile.legalRecognition ?? defaultForm.legalRecognition,
      communityCode: profile.communityCode ?? defaultForm.communityCode,
      officialAddress: profile.officialAddress ?? defaultForm.officialAddress,
      neighborhood: profile.neighborhood ?? defaultForm.neighborhood,
      locality: profile.locality || defaultForm.locality,
      latitude: profile.latitude ?? "4.5047526",
      longitude: profile.longitude ?? "-74.1068319",
      mapEmbedUrl: profile.mapEmbedUrl ?? confirmedMapEmbed,
      verificationStatus: profile.verificationStatus,
      verificationSourceUrl: profile.verificationSourceUrl ?? "",
      verificationNotes: profile.verificationNotes ?? "",
    });
  }, [profileQuery.data]);

  const update = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate({
      ...form,
      nit: form.nit || null,
      legalRecognition: form.legalRecognition || null,
      communityCode: form.communityCode || null,
      officialAddress: form.officialAddress || null,
      neighborhood: form.neighborhood || null,
      latitude: form.latitude || null,
      longitude: form.longitude || null,
      mapEmbedUrl: form.mapEmbedUrl || null,
      verificationSourceUrl: form.verificationSourceUrl || null,
      verificationNotes: form.verificationNotes || null,
    });
  };

  return (
    <JacShell
      eyebrow="Gobierno y Personería Jurídica"
      title="Ficha e Identidad Institucional"
      description="Personería jurídica de 1991, NIT, código comunal, cuadro de dignatarios y carnet digital oficial."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_.95fr]">
        {/* Form Card */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-black text-foreground">
                  Identidad Jurídica & Registro
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Información legal registrada ante la Personería y la Alcaldía Local de Usme.
                </p>
              </div>
              <StatusBadge status={form.verificationStatus} />
            </div>

            <form onSubmit={submit} className="mt-7 grid gap-5">
              <Field
                label="Nombre Jurídico Oficial"
                value={form.legalName}
                onChange={(value) => update("legalName", value)}
                required
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="NIT Institucional"
                  value={form.nit}
                  onChange={(value) => update("nit", value)}
                  placeholder="830.061.828-3"
                />
                <Field
                  label="Código Comunal IDPAC"
                  value={form.communityCode}
                  onChange={(value) => update("communityCode", value)}
                  placeholder="5084"
                />
              </div>

              <Field
                label="Personería Jurídica (Decreto/Acta 1991)"
                value={form.legalRecognition}
                onChange={(value) => update("legalRecognition", value)}
                placeholder="Personería Jurídica N.º 0837 del 15 de marzo de 1991"
              />

              <Field
                label="Dirección Oficial Sede Comunal"
                value={form.officialAddress}
                onChange={(value) => update("officialAddress", value)}
                placeholder="Carrera 54D # 167B-11, Usme, Bogotá D.C."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Localidad"
                  value={form.locality}
                  onChange={(value) => update("locality", value)}
                  required
                />
                <Field
                  label="Barrio / Sector"
                  value={form.neighborhood}
                  onChange={(value) => update("neighborhood", value)}
                  placeholder="Bellavista"
                />
              </div>

              <Field
                label="URL del Mapa Embed (Google Maps)"
                value={form.mapEmbedUrl}
                onChange={(value) => update("mapEmbedUrl", value)}
                placeholder="https://www.google.com/maps/embed?..."
              />

              <div className="grid gap-2 text-sm font-bold text-foreground">
                <Label>Estado de Verificación Oficial</Label>
                <select
                  value={form.verificationStatus}
                  onChange={(e) => update("verificationStatus", e.target.value as any)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F4C81]"
                >
                  <option value="pendiente">Pendiente de verificación</option>
                  <option value="observado">Observado con observaciones</option>
                  <option value="verificado">Verificado por la Directiva (Vigente)</option>
                </select>
              </div>

              <Field
                label="Enlace Soporte de Personería (PDF / Drive)"
                value={form.verificationSourceUrl}
                onChange={(value) => update("verificationSourceUrl", value)}
                placeholder="https://…"
              />

              <div className="grid gap-2 text-sm font-bold text-foreground">
                <Label>Notas de Control y Registro</Label>
                <Textarea
                  value={form.verificationNotes}
                  onChange={(e) => update("verificationNotes", e.target.value)}
                  placeholder="Documento, fecha y responsable de revisión."
                  className="min-h-24 rounded-xl border-input bg-background"
                />
              </div>

              {isAuthenticated ? (
                <Button
                  type="submit"
                  disabled={save.isPending}
                  className="mt-2 w-full rounded-xl bg-[#0F4C81] text-white hover:bg-[#1E3A8A] font-bold shadow-md"
                >
                  <Save className="mr-2 h-4 w-4 text-amber-300" />
                  {save.isPending ? "Guardando..." : "Actualizar Ficha Institucional"}
                </Button>
              ) : (
                <div className="rounded-xl bg-amber-100/70 dark:bg-amber-950/60 p-4 text-sm leading-relaxed text-amber-900 dark:text-amber-200 border border-amber-300/40">
                  <BadgeInfo className="mr-2 inline h-4 w-4 text-amber-700" />
                  Inicia sesión con perfil directivo para editar los datos institucionales.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Map & Digital Carnet Preview */}
        <div className="grid content-start gap-6">
          {/* Official Location Map */}
          <InstitutionalMap
            address={form.officialAddress}
            latitude={form.latitude}
            longitude={form.longitude}
            mapEmbedUrl={form.mapEmbedUrl}
          />

          {/* Digital Carnet Preview Component */}
          <Card className="relative overflow-hidden border-2 border-[#0F4C81]/30 bg-gradient-to-br from-[#0F4C81] via-[#166534] to-[#0F172A] text-white shadow-xl rounded-2xl">
            {/* Watermark Logo */}
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
              <JacLogo variant="watermark" size={70} />
            </div>

            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <JacLogo size="sm" variant="full" showText={false} />
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950">
                    <Award className="h-3 w-3" /> Carnet Oficial 1991
                  </span>
                  <p className="mt-1 text-[11px] font-bold text-emerald-200">
                    JAC Bellavista · Usme
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Afiliado Activo
                  </p>
                  <p className="text-lg font-black text-white">
                    {user?.name || "Vecino Afiliado"}
                  </p>
                  <p className="text-xs text-white/80 font-medium">
                    NIT JAC: {form.nit || "830.061.828-3"}
                  </p>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Cod. Comunal: {form.communityCode || "5084"}
                  </p>
                </div>

                <div className="flex flex-col items-center bg-white p-2.5 rounded-xl text-slate-950 shadow-md">
                  <QrCode className="h-12 w-12 text-[#0F4C81]" />
                  <span className="text-[8px] font-black tracking-widest text-[#0F4C81] mt-1 uppercase">
                    Verificado
                  </span>
                </div>
              </div>

              <div className="border-t border-white/15 pt-3 flex items-center justify-between text-[11px] text-white/80 font-medium">
                <span>Lema: "Todos Somos Comunidad"</span>
                <span className="text-amber-300 font-bold">Vigencia 2026</span>
              </div>
            </CardContent>
          </Card>

          {/* Governance Security Note */}
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">
                    Verificación de Gobernabilidad
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Copia digital y trazabilidad respaldada bajo estatutos comunales y personería jurídica de 1991.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <FileCheck2 className="h-4 w-4" />
                Dignatario Activo: {user?.name || "Sesión no autenticada"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIGNATARIOS & ADMINISTRATIVE USER ASSIGNMENT SECTION */}
      <div className="mt-8">
        <DignatariosAssignmentSection />
      </div>
    </JacShell>
  );
}

function DignatariosAssignmentSection() {
  const { isAuthenticated } = useAuth();
  const dignatariosQuery = trpc.institutional.dignatarios.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const utils = trpc.useUtils();

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedJacRole, setSelectedJacRole] = useState<"directiva" | "coordinador_comite" | "tesorero_fiscal" | "secretario" | "afiliado">("directiva");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("admin");

  const assignRoleMutation = trpc.institutional.assignRole.useMutation({
    onSuccess: async () => {
      await utils.institutional.dignatarios.invalidate();
      toast.success("Cargo administrativo y rol asignado correctamente.");
    },
    onError: (error) => toast.error(error.message),
  });

  const dignatarios = dignatariosQuery.data ?? [];

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Selecciona un usuario para asignar cargo.");
      return;
    }
    assignRoleMutation.mutate({
      userId: Number(selectedUserId),
      jacRole: selectedJacRole,
      role: selectedRole,
    });
  };

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
      <div className="border-b border-border bg-[#0F4C81]/10 dark:bg-blue-950/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-extrabold text-foreground flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Cuadro de Dignatarios & Asignación de Roles Administrativos
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Asignación de cargos para la Directiva, Fiscalía, Secretaría General y Coordinaciones de Comité.
          </p>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Role Assignment Form */}
        {isAuthenticated && (
          <form onSubmit={handleAssign} className="p-5 bg-muted/40 rounded-xl border border-border space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#0F4C81] dark:text-blue-400">
              Asignar o Modificar Cargo Administrativo
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs font-bold mb-1.5 block">Usuario / Dignatario *</Label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F4C81]"
                  required
                >
                  <option value="">Seleccionar dignatario...</option>
                  {dignatarios.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.email} ({d.jacRole})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold mb-1.5 block">Cargo JAC *</Label>
                <select
                  value={selectedJacRole}
                  onChange={(e) => setSelectedJacRole(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F4C81]"
                >
                  <option value="directiva">Directiva / Presidencia</option>
                  <option value="tesorero_fiscal">Tesorería & Fiscalía</option>
                  <option value="secretario">Secretaría General</option>
                  <option value="coordinador_comite">Coordinación de Comité</option>
                  <option value="afiliado">Afiliado General</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold mb-1.5 block">Permiso de Plataforma *</Label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0F4C81]"
                >
                  <option value="admin">Administrador (Control Total)</option>
                  <option value="user">Usuario Estándar (Lectura/Registro)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={assignRoleMutation.isPending}
                className="rounded-xl bg-[#1B8A5A] text-white hover:bg-[#166534] font-bold px-6"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {assignRoleMutation.isPending ? "Asignando..." : "Guardar Asignación de Cargo"}
              </Button>
            </div>
          </form>
        )}

        {/* Dignatarios Directory Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dignatarios.map((dignatario) => {
            const config = JAC_ROLE_LABELS[dignatario.jacRole] ?? JAC_ROLE_LABELS.afiliado;
            const Icon = config.icon;
            return (
              <Card key={dignatario.id} className="border-border bg-card shadow-xs rounded-xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                      {config.label.split("/")[0]}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {dignatario.role}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{dignatario.name || "Dignatario Registrado"}</p>
                    <p className="text-xs text-muted-foreground truncate">{dignatario.email || "Sin correo"}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2 text-sm font-bold text-foreground">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-10 rounded-xl border-input bg-background font-medium"
      />
    </div>
  );
}
