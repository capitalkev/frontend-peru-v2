// src/features/operaciones/components/TablaOperaciones.tsx
import {
  FileText,
  MoreHorizontal,
  Eye,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { OperacionDetalle } from "../types";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  Ingresado: {
    label: "Ingresado",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  Aprobado: {
    label: "Aprobado",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Rechazado: {
    label: "Rechazado",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  // ... (puedes agregar los demás estados que ya tenías)
};

interface TablaOperacionesProps {
  operaciones: OperacionDetalle[];
  loading: boolean;
  isAdmin: boolean;
  onViewDetails: (id: string, codigo: string) => void;
}

export function TablaOperaciones({
  operaciones,
  loading,
  isAdmin,
  onViewDetails,
}: TablaOperacionesProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th
                className={cn(
                  "px-6 py-5 text-xs font-semibold text-slate-500 uppercase",
                  isAdmin ? "w-1/3" : "w-2/5",
                )}
              >
                Cliente / Deudor
              </th>
              {isAdmin && (
                <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase">
                  Ejecutivo
                </th>
              )}
              <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase">
                Monto
              </th>
              <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-6 py-6 bg-slate-50/30 h-20"
                  ></td>
                </tr>
              ))
            ) : operaciones.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="py-16 text-center">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    No hay operaciones para mostrar
                  </p>
                </td>
              </tr>
            ) : (
              operaciones.map((op) => {
                const status = STATUS_CONFIG[op.estado] || {
                  label: op.estado,
                  color: "bg-slate-100 text-slate-700",
                  icon: FileText,
                };
                const StatusIcon = status.icon;

                return (
                  <tr
                    key={op.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-800 leading-tight">
                          {op.nombre_cliente}
                        </span>
                        <span className="text-xs text-slate-400">
                          {op.codigo_operacion}
                        </span>
                      </div>
                    </td>
                    {/* Aquí va el resto de tus <td> que ya tenías configurados... */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onViewDetails(op.id, op.codigo_operacion)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
