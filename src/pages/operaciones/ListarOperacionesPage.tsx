import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMisOperaciones } from "@/features/operaciones/hooks/useOperaciones";
import { TablaOperaciones } from "@/features/operaciones/components/TablaOperaciones";
import { Header } from "@/components/layout/Header";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ListaOperacionesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { operaciones, loading, error } = useMisOperaciones(user?.email);

  // Filtramos visualmente
  const filteredOps = operaciones.filter(
    (op) =>
      op.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.codigo_operacion?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isAdmin = false;

  return (
    <div className="space-y-6">
      <Header title="Mis Operaciones Cargadas" />
      <div className="max-w-md">
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Buscar por cliente o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Error: {error}
        </div>
      ) : (
        <TablaOperaciones
          operaciones={filteredOps}
          loading={loading}
          isAdmin={isAdmin}
          onViewDetails={(id: number, codigo: string) =>
            navigate(`/operaciones/${id}?codigo=${codigo}`)
          }
        />
      )}
    </div>
  );
}
