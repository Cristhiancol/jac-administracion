import React, { useState } from "react";
import { JacShell } from "@/components/jac/JacShell";
import { trpc } from "@/lib/trpc";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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
  Loader2
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
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 border-none">Planeada / Inscripción</Badge>;
      case "en_curso":
      case "activa":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 border-none">Activa / En curso</Badge>;
      case "finalizado":
      case "completada":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 border-none">Finalizada</Badge>;
      case "cancelado":
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 border-none">Cancelada</Badge>;
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
      title="Campeonatos & Campañas"
      description="Torneos deportivos, copas relámpago y campañas ambientales, culturales y de salud."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2 p-1 bg-muted rounded-xl">
            <TabsTrigger 
              value="campeonatos"
              className="rounded-lg data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white dark:data-[state=active]:bg-[#1B8A5A]"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Campeonatos
            </TabsTrigger>
            <TabsTrigger 
              value="campanas"
              className="rounded-lg data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white dark:data-[state=active]:bg-[#1B8A5A]"
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
                    <Button className="w-full sm:w-auto bg-[#0F4C81] hover:bg-[#0a355c] dark:bg-[#1B8A5A] dark:hover:bg-[#146b45] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Campeonato
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Campeonato</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChampionshipSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input 
                          id="nombre" 
                          required 
                          value={championshipForm.nombre}
                          onChange={(e) => setChampionshipForm({...championshipForm, nombre: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deporte">Deporte</Label>
                          <Input 
                            id="deporte" 
                            required 
                            placeholder="Ej. Fútbol, Baloncesto"
                            value={championshipForm.deporte}
                            onChange={(e) => setChampionshipForm({...championshipForm, deporte: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipo">Tipo</Label>
                          <Select 
                            value={championshipForm.tipo} 
                            onValueChange={(val) => setChampionshipForm({...championshipForm, tipo: val})}
                          >
                            <SelectTrigger id="tipo">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="campeonato">Campeonato</SelectItem>
                              <SelectItem value="copa">Copa</SelectItem>
                              <SelectItem value="torneo_relampago">Torneo Relámpago</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fechaInicio">Fecha Inicio</Label>
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
                            required 
                            value={championshipForm.fechaFin}
                            onChange={(e) => setChampionshipForm({...championshipForm, fechaFin: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxEquipos">Máximo de Equipos</Label>
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
                        <Label htmlFor="reglamento">Reglamento (Resumen)</Label>
                        <Textarea 
                          id="reglamento" 
                          rows={3} 
                          value={championshipForm.reglamento}
                          onChange={(e) => setChampionshipForm({...championshipForm, reglamento: e.target.value})}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsChampionshipDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createChampionship.isPending}>
                          {createChampionship.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-[#0F4C81] hover:bg-[#0a355c] dark:bg-[#1B8A5A] dark:hover:bg-[#146b45] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Campaña
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Campaña</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCampaignSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título</Label>
                        <Input 
                          id="titulo" 
                          required 
                          value={campaignForm.titulo}
                          onChange={(e) => setCampaignForm({...campaignForm, titulo: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipoCampana">Tipo</Label>
                        <Select 
                          value={campaignForm.tipo} 
                          onValueChange={(val) => setCampaignForm({...campaignForm, tipo: val})}
                        >
                          <SelectTrigger id="tipoCampana">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ambiental">Ambiental</SelectItem>
                            <SelectItem value="salud">Salud</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="educativa">Educativa</SelectItem>
                            <SelectItem value="deportiva">Deportiva</SelectItem>
                            <SelectItem value="otra">Otra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fechaInicioC">Fecha Inicio</Label>
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
                            required 
                            value={campaignForm.fechaFin}
                            onChange={(e) => setCampaignForm({...campaignForm, fechaFin: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea 
                          id="descripcion" 
                          rows={3} 
                          required 
                          value={campaignForm.descripcion}
                          onChange={(e) => setCampaignForm({...campaignForm, descripcion: e.target.value})}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCampaignDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createCampaign.isPending}>
                          {createCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>

        <TabsContent value="campeonatos" className="animate-in fade-in-50 duration-500">
          {isChampionshipsLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#0F4C81] dark:text-[#1B8A5A]" />
            </div>
          ) : !championships || championships.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-xl bg-card/50">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No hay campeonatos</h3>
              <p className="text-muted-foreground text-sm">No se han registrado torneos deportivos aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {championships.map((champ) => (
                <Card key={champ.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-sm">
                  <div className="h-2 w-full bg-gradient-to-r from-[#0F4C81] to-[#1B8A5A] opacity-80" />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Medal className="h-5 w-5" />
                      </div>
                      {getStatusBadge(champ.status)}
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{champ.name}</CardTitle>
                    <CardDescription className="capitalize font-medium flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      {champ.sport} • {champ.championshipType.replace('_', ' ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 shrink-0 opacity-70" />
                      <span>{formatDate(String(champ.startsAt))} - {formatDate(champ.endsAt ? String(champ.endsAt) : undefined)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2 shrink-0 opacity-70" />
                      <span>Máx. {champ.maxTeams ?? '—'} equipos</span>
                    </div>
                    {champ.rules && (
                      <div className="flex items-start text-sm text-muted-foreground">
                        <ScrollText className="h-4 w-4 mr-2 mt-0.5 shrink-0 opacity-70" />
                        <span className="line-clamp-2">{champ.rules}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="campanas" className="animate-in fade-in-50 duration-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((camp) => (
                <Card key={camp.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-sm">
                  <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-amber-600 opacity-80" />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2.5 bg-muted rounded-xl">
                        {getCampaignIcon(camp.campaignType)}
                      </div>
                      {getStatusBadge(camp.status)}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{camp.title}</CardTitle>
                    <CardDescription className="capitalize font-medium">
                      Campaña {camp.campaignType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {camp.description}
                    </p>
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {formatDate(String(camp.startsAt))}
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          {formatDate(camp.endsAt ? String(camp.endsAt) : undefined)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </JacShell>
  );
}
