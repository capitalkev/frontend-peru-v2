// src/pages/operaciones/ListarOperacionesPage.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMisOperaciones } from "@/features/operaciones/hooks/useOperaciones";
import { TablaOperaciones } from "@/features/operaciones/components/TablaOperaciones";
import { Header } from "@/components/layout/Header";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ListaOperacionesPage() {
  const { authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { operaciones, loading, error } = useMisOperaciones(authUser?.email);

  const filteredOps = operaciones.filter(
    (op) =>
      op.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.codigo_operacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.nombre_ejecutivo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isAdmin = authUser?.roles?.includes("admin") || false;

  return (
    <div className="space-y-6">
      <Header title="Mis Operaciones Cargadas" />

      <div className="flex items-center gap-3">
        <div className="w-full max-w-md">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Buscar por cliente, código o ejecutivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg shadow-sm">
          <strong>Error al cargar operaciones:</strong> {error}
        </div>
      ) : (
        <TablaOperaciones
          operaciones={filteredOps}
          loading={loading}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
