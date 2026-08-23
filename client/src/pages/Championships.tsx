import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JacShell } from "@/components/jac/JacShell";
import { trpc } from "@/lib/trpc";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Flag, 
  Swords, 
  Heart, 
  TreePine, 
  Palette, 
  GraduationCap, 
  Plus, 
  Calendar,
  Users,
  Activity,
  ScrollText,
  Loader2,
  Sparkles,
  Flame,
  Zap,
  Award
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Helpers
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CO", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  }).format(date);
};

export default function Championships() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("campeonatos");

  // Championships State
  const [isChampionshipDialogOpen, setIsChampionshipDialogOpen] = useState(false);
  const [championshipForm, setChampionshipForm] = useState({
    nombre: "",
    deporte: "",
    tipo: "campeonato",
    fechaInicio: "",
    fechaFin: "",
    maxEquipos: "8",
    reglamento: ""
  });

  // Campaigns State
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    titulo: "",
    tipo: "ambiental",
    descripcion: "",
    fechaInicio: "",
    fechaFin: ""
  });

  // tRPC Queries & Mutations
  const { 
    data: championships, 
    isLoading: isChampionshipsLoading,
    refetch: refetchChampionships
  } = trpc.championships.list.useQuery();
  
  const createChampionship = trpc.championships.create.useMutation({
    onSuccess: () => {
      setIsChampionshipDialogOpen(false);
      setChampionshipForm({
        nombre: "", deporte: "", tipo: "campeonato",
        fechaInicio: "", fechaFin: "", maxEquipos: "8", reglamento: ""
      });
      refetchChampionships();
    }
  });

  const { 
    data: campaigns, 
    isLoading: isCampaignsLoading,
    refetch: refetchCampaigns
  } = trpc.campaigns.list.useQuery();

  const createCampaign = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      setIsCampaignDialogOpen(false);
      setCampaignForm({
        titulo: "", tipo: "ambiental", descripcion: "",
        fechaInicio: "", fechaFin: ""
      });
      refetchCampaigns();
    }
  });

  // Handlers
  const handleChampionshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChampionship.mutate({
      name: championshipForm.nombre,
      sport: championshipForm.deporte,
      championshipType: championshipForm.tipo as "campeonato" | "copa" | "torneo_relampago",
      startsAt: new Date(championshipForm.fechaInicio),
      endsAt: championshipForm.fechaFin ? new Date(championshipForm.fechaFin) : null,
      maxTeams: parseInt(championshipForm.maxEquipos, 10) || null,
      rules: championshipForm.reglamento || null,
    });
  };

  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign.mutate({
      title: campaignForm.titulo,
      campaignType: campaignForm.tipo as "ambiental" | "salud" | "cultural" | "educativa" | "deportiva" | "otra",
      description: campaignForm.descripcion || null,
      startsAt: new Date(campaignForm.fechaInicio),
      endsAt: campaignForm.fechaFin ? new Date(campaignForm.fechaFin) : null,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "inscripcion":
      case "planeada":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-none font-bold">Inscripción / Planeada</Badge>;
      case "en_curso":
      case "activa":
        return <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-none font-bold animate-pulse">🔥 En Curso</Badge>;
      case "finalizado":
      case "completada":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none font-bold">🏆 Finalizado</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const getCampaignIcon = (tipo: string) => {
    switch (tipo) {
      case "ambiental": return <TreePine className="h-5 w-5 text-emerald-500" />;
      case "salud": return <Heart className="h-5 w-5 text-rose-500" />;
      case "cultural": return <Palette className="h-5 w-5 text-purple-500" />;
      case "educativa": return <GraduationCap className="h-5 w-5 text-blue-500" />;
      case "deportiva": return <Swords className="h-5 w-5 text-orange-500" />;
      default: return <Flag className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <JacShell
      eyebrow="Deportes y Campañas Comunitarias"
      title="Campeonatos & Campañas Social-Comunitarias"
      description="Torneos deportivos, copas relámpago y campañas ambientales, culturales y de salud en la comunidad de Usme."
    >
      {/* ANIMATED HERO HEADER BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F4C81] via-[#166534] to-[#0F172A] p-6 sm:p-8 text-white shadow-xl mb-8"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Trophy className="h-64 w-64 text-amber-300" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 backdrop-blur-md px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/30"
          >
            <Sparkles className="h-3.5 w-3.5" /> Torneos & Deportes JAC Bellavista 1991
          </motion.div>

          <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pasión Deportiva & Integración Vecinal
          </h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Inscripción a campeonatos de microfútbol, baloncesto, torneos relámpago y convocatorias comunitarias para niños, jóvenes y adultos.
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2 p-1 bg-muted rounded-xl">
            <TabsTrigger 
              value="campeonatos"
              className="rounded-lg font-bold data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white dark:data-[state=active]:bg-[#1B8A5A] transition-all"
            >
              <Trophy className="w-4 h-4 mr-2 text-amber-300" />
              Campeonatos
            </TabsTrigger>
            <TabsTrigger 
              value="campanas"
              className="rounded-lg font-bold data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white dark:data-[state=active]:bg-[#1B8A5A] transition-all"
            >
              <Flag className="w-4 h-4 mr-2" />
              Campañas
            </TabsTrigger>
          </TabsList>

          {isAuthenticated && (
            <div className="flex-shrink-0">
              {activeTab === "campeonatos" ? (
                <Dialog open={isChampionshipDialogOpen} onOpenChange={setIsChampionshipDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-[#0F4C81] hover:bg-[#0a355c] dark:bg-[#1B8A5A] dark:hover:bg-[#146b45] text-white font-bold shadow-md transition-all">
                      <Plus className="w-4 h-4 mr-2 text-amber-300" />
                      Nuevo Campeonato
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Campeonato Deportivo</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChampionshipSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre del Campeonato *</Label>
                        <Input 
                          id="nombre" 
                          required 
                          placeholder="Ej. Copa Navideña de Microfútbol 2026"
                          value={championshipForm.nombre}
                          onChange={(e) => setChampionshipForm({...championshipForm, nombre: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deporte">Deporte *</Label>
                          <Input 
                            id="deporte" 
                            required 
                            placeholder="Ej. Fútbol, Baloncesto"
                            value={championshipForm.deporte}
                            onChange={(e) => setChampionshipForm({...championshipForm, deporte: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipo">Modalidad *</Label>
                          <Select 
                            value={championshipForm.tipo} 
                            onValueChange={(val) => setChampionshipForm({...championshipForm, tipo: val})}
                          >
                            <SelectTrigger id="tipo">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="campeonato">Campeonato Largo</SelectItem>
                              <SelectItem value="copa">Copa</SelectItem>
                              <SelectItem value="torneo_relampago">Torneo Relámpago</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
                          <Input 
                            id="fechaInicio" 
                            type="date" 
                            required 
                            value={championshipForm.fechaInicio}
                            onChange={(e) => setChampionshipForm({...championshipForm, fechaInicio: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fechaFin">Fecha Fin</Label>
                          <Input 
                            id="fechaFin" 
                            type="date" 
                            value={championshipForm.fechaFin}
                            onChange={(e) => setChampionshipForm({...championshipForm, fechaFin: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxEquipos">Máximo de Equipos *</Label>
                        <Input 
                          id="maxEquipos" 
                          type="number" 
                          min="2" 
                          required 
                          value={championshipForm.maxEquipos}
                          onChange={(e) => setChampionshipForm({...championshipForm, maxEquipos: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reglamento">Reglamento y Condiciones</Label>
                        <Textarea 
                          id="reglamento" 
                          rows={3} 
                          placeholder="Requisitos de inscripción, planillaje y premiación."
                          value={championshipForm.reglamento}
                          onChange={(e) => setChampionshipForm({...championshipForm, reglamento: e.target.value})}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsChampionshipDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createChampionship.isPending} className="bg-[#1B8A5A] text-white font-bold">
                          {createChampionship.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar Campeonato
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-[#0F4C81] hover:bg-[#0a355c] dark:bg-[#1B8A5A] dark:hover:bg-[#146b45] text-white font-bold shadow-md transition-all">
                      <Plus className="w-4 h-4 mr-2 text-amber-300" />
                      Nueva Campaña
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Campaña Comunitaria</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCampaignSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título de la Campaña *</Label>
                        <Input 
                          id="titulo" 
                          required 
                          placeholder="Ej. Jornada de Limpieza y Recuperación del Parque"
                          value={campaignForm.titulo}
                          onChange={(e) => setCampaignForm({...campaignForm, titulo: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipoCampana">Tipo de Campaña *</Label>
                        <Select 
                          value={campaignForm.tipo} 
                          onValueChange={(val) => setCampaignForm({...campaignForm, tipo: val})}
                        >
                          <SelectTrigger id="tipoCampana">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ambiental">Ambiental & Reforestación</SelectItem>
                            <SelectItem value="salud">Salud & Prevención</SelectItem>
                            <SelectItem value="cultural">Cultural & Artística</SelectItem>
                            <SelectItem value="educativa">Educativa & Capacitación</SelectItem>
                            <SelectItem value="deportiva">Deportiva & Recreativa</SelectItem>
                            <SelectItem value="otra">Otra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fechaInicioC">Fecha Inicio *</Label>
                          <Input 
                            id="fechaInicioC" 
                            type="date" 
                            required 
                            value={campaignForm.fechaInicio}
                            onChange={(e) => setCampaignForm({...campaignForm, fechaInicio: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fechaFinC">Fecha Fin</Label>
                          <Input 
                            id="fechaFinC" 
                            type="date" 
                            value={campaignForm.fechaFin}
                            onChange={(e) => setCampaignForm({...campaignForm, fechaFin: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción & Objetivos *</Label>
                        <Textarea 
                          id="descripcion" 
                          rows={3} 
                          required 
                          placeholder="Detalles del evento y convocatoria comunitaria."
                          value={campaignForm.descripcion}
                          onChange={(e) => setCampaignForm({...campaignForm, descripcion: e.target.value})}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCampaignDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createCampaign.isPending} className="bg-[#1B8A5A] text-white font-bold">
                          {createCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar Campaña
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>

        <TabsContent value="campeonatos">
          {isChampionshipsLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#0F4C81] dark:text-[#1B8A5A]" />
            </div>
          ) : !championships || championships.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-xl bg-card/50">
              <Trophy className="h-12 w-12 mx-auto text-amber-500 mb-4 animate-bounce" />
              <h3 className="text-lg font-semibold mb-1">No hay campeonatos activos</h3>
              <p className="text-muted-foreground text-sm">Registra el primer torneo deportivo de la JAC Bellavista.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {championships.map((champ) => (
                <motion.div
                  key={champ.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <Card className="overflow-hidden border-border/60 bg-card shadow-sm hover:shadow-xl transition-all duration-300 relative group">
                    <div className="h-2.5 w-full bg-gradient-to-r from-[#0F4C81] via-[#1B8A5A] to-amber-400" />
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2.5 bg-amber-400/10 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                          <Award className="h-6 w-6" />
                        </div>
                        {getStatusBadge(champ.status)}
                      </div>
                      <CardTitle className="text-xl font-extrabold line-clamp-1 text-foreground">{champ.name}</CardTitle>
                      <CardDescription className="capitalize font-bold text-xs text-[#1B8A5A] dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                        <Activity className="h-3.5 w-3.5" />
                        {champ.sport} • {champ.championshipType.replace('_', ' ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-5">
                      <div className="flex items-center text-xs font-semibold text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2 shrink-0 text-[#0F4C81]" />
                        <span>{formatDate(String(champ.startsAt))} - {formatDate(champ.endsAt ? String(champ.endsAt) : undefined)}</span>
                      </div>
                      <div className="flex items-center text-xs font-semibold text-muted-foreground">
                        <Users className="h-4 w-4 mr-2 shrink-0 text-[#1B8A5A]" />
                        <span>Cupo: Máx. {champ.maxTeams ?? '—'} Equipos</span>
                      </div>
                      {champ.rules && (
                        <div className="flex items-start text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
                          <ScrollText className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-amber-600" />
                          <span className="line-clamp-2 font-medium">{champ.rules}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="campanas">
          {isCampaignsLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#0F4C81] dark:text-[#1B8A5A]" />
            </div>
          ) : !campaigns || campaigns.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-xl bg-card/50">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No hay campañas</h3>
              <p className="text-muted-foreground text-sm">No se han registrado campañas comunitarias aún.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {campaigns.map((camp) => (
                <motion.div
                  key={camp.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <Card className="overflow-hidden border-border/60 bg-card shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="h-2.5 w-full bg-gradient-to-r from-amber-400 to-emerald-600" />
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2.5 bg-muted rounded-2xl">
                          {getCampaignIcon(camp.campaignType)}
                        </div>
                        {getStatusBadge(camp.status)}
                      </div>
                      <CardTitle className="text-xl font-extrabold line-clamp-2 text-foreground">{camp.title}</CardTitle>
                      <CardDescription className="capitalize font-bold text-xs text-[#0F4C81] dark:text-blue-300">
                        Campaña {camp.campaignType}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {camp.description}
                      </p>
                      <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#1B8A5A]" />
                            {formatDate(String(camp.startsAt))}
                          </span>
                          <span className="flex items-center text-muted-foreground">
                            {formatDate(camp.endsAt ? String(camp.endsAt) : undefined)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </JacShell>
  );
}
