import React, { useMemo, useState } from "react";
import { JacShell } from "@/components/jac/JacShell";
import { DigitalAffiliateCard } from "@/components/affiliate/DigitalAffiliateCard";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Upload,
  UserPlus,
  Search,
  Trash2,
  QrCode,
  CheckCircle,
  XCircle,
  X,
  AlertCircle
} from "lucide-react";

interface Affiliate {
  id: number;
  code: string;
  fullName: string;
  cedula: string;
  address: string | null;
  phone: string | null;
  commissionName: string | null;
  status: "activo" | "inactivo" | "suspendido";
  qrToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  attendedLastAssembly?: boolean;
}

interface AffiliateFormData {
  code: string;
  fullName: string;
  cedula: string;
  address: string;
  phone: string;
  commissionName: string;
}

const initialFormState: AffiliateFormData = {
  code: "",
  fullName: "",
  cedula: "",
  address: "",
  phone: "",
  commissionName: "",
};

export default function Affiliates() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<AffiliateFormData>(initialFormState);
  const [activeQr, setActiveQr] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("carnet");
  });

  // tRPC Queries & Mutations
  const { data: affiliates = [], refetch, isLoading } = trpc.affiliates.list.useQuery();
  const createAffiliate = trpc.affiliates.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddModalOpen(false);
      setFormData(initialFormState);
    },
  });
  const bulkImport = trpc.affiliates.bulkImport.useMutation({
    onSuccess: () => refetch(),
  });
  const removeAffiliate = trpc.affiliates.remove.useMutation({
    onSuccess: () => refetch(),
  });

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter((a: Affiliate) => {
      const searchLower = searchTerm.toLowerCase();
      if (isAdmin) {
        return (
          a.fullName.toLowerCase().includes(searchLower) ||
          a.cedula.toLowerCase().includes(searchLower)
        );
      }
      return a.fullName.toLowerCase().includes(searchLower);
    });
  }, [affiliates, searchTerm, isAdmin]);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    // Parse CSV: code,fullName,cedula,address,phone,commissionName
    const lines = text.split("\n").filter((l) => l.trim());
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(",");
      return {
        code: cols[0]?.trim() || "",
        fullName: cols[1]?.trim() || "",
        cedula: cols[2]?.trim() || "",
        address: cols[3]?.trim() || "",
        phone: cols[4]?.trim() || "",
        commissionName: cols[5]?.trim() || "",
      };
    }).filter((r) => r.cedula);
    // Send to backend
    bulkImport.mutate({ affiliates: rows });
    e.target.value = "";
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAffiliate.mutate(formData);
  };

  const getStatusColor = (status: Affiliate["status"]) => {
    switch (status) {
      case "activo":
        return "bg-green-100 text-[#1B8A5A] border-[#1B8A5A]/30 dark:bg-[#1B8A5A]/20 dark:text-green-300";
      case "suspendido":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <JacShell
      eyebrow="Libro de Afiliados"
      title="Directorio de Afiliados"
      description="Registro, importación Excel/CSV y credenciales digitales QR de los afiliados de la JAC Bellavista."
    >
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F4C81] dark:text-blue-400">
              Libro de Afiliados
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Directorio oficial de la Junta de Acción Comunal
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={isAdmin ? "Buscar por nombre o cédula..." : "Buscar por nombre..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-full border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/50 dark:text-gray-200 transition-all"
                aria-label="Buscar afiliados"
              />
            </div>
            {isAdmin && (
              <>
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors shadow-sm hover:shadow-md">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Importar CSV</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#0F4C81] hover:bg-[#0c3d66] text-white rounded-full font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Nuevo Afiliado</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Affiliate List */}
        <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {isAdmin && <th className="p-4 font-semibold text-[#0F4C81] dark:text-blue-300">Código</th>}
                  <th className="p-4 font-semibold text-[#0F4C81] dark:text-blue-300">Nombre Completo</th>
                  {isAdmin && <th className="p-4 font-semibold text-[#0F4C81] dark:text-blue-300">Cédula</th>}
                  <th className="p-4 font-semibold text-[#0F4C81] dark:text-blue-300">Comité</th>
                  <th className="p-4 font-semibold text-[#0F4C81] dark:text-blue-300 text-center">Estado</th>
                  <th className="p-4 font-semibold text-[#0F4C81] dark:text-blue-300 text-center">Asistencia</th>
                  {isAdmin && <th className="p-4 font-semibold text-[#0F4C81] dark:text-blue-300 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Cargando afiliados...
                    </td>
                  </tr>
                ) : filteredAffiliates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No se encontraron afiliados.
                    </td>
                  </tr>
                ) : (
                  filteredAffiliates.map((affiliate: Affiliate) => (
                    <tr
                      key={affiliate.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800/80 transition-colors group"
                    >
                      {isAdmin && (
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {affiliate.code}
                        </td>
                      )}
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {affiliate.fullName}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {affiliate.cedula}
                        </td>
                      )}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          {affiliate.commissionName || "Sin comité"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            affiliate.status
                          )}`}
                        >
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {affiliate.attendedLastAssembly ? (
                          <CheckCircle className="h-5 w-5 text-[#1B8A5A] mx-auto" aria-label="Asistió" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400 mx-auto" aria-label="Faltó" />
                        )}
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                setActiveQr(activeQr === affiliate.cedula ? null : affiliate.cedula)
                              }
                              className="p-1.5 text-[#0F4C81] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                              title="Generar QR"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("¿Estás seguro de eliminar este afiliado?")) {
                                  removeAffiliate.mutate({ id: affiliate.id });
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {activeQr === affiliate.cedula && (
                            <DigitalAffiliateCard affiliate={affiliate} />
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Modal */}
        {isAdmin && isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-0">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-[#0F4C81] dark:text-blue-400">
                  Agregar Afiliado
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Código
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#0F4C81]/50 focus:border-[#0F4C81] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cédula
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#0F4C81]/50 focus:border-[#0F4C81] outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre Completo
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#0F4C81]/50 focus:border-[#0F4C81] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#0F4C81]/50 focus:border-[#0F4C81] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#0F4C81]/50 focus:border-[#0F4C81] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comité
                      </label>
                      <input
                        type="text"
                        value={formData.commissionName}
                        onChange={(e) => setFormData({ ...formData, commissionName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#0F4C81]/50 focus:border-[#0F4C81] outline-none"
                        placeholder="Ej: Deportes"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={createAffiliate.isPending}
                      className="flex-1 px-4 py-2 bg-[#1B8A5A] hover:bg-[#156e47] text-white rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {createAffiliate.isPending ? "Guardando..." : "Guardar Afiliado"}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </JacShell>
  );
}
