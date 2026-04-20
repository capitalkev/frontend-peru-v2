import { Eye, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OperacionDetalle, StatusConfig } from "@/src/features/operaciones/types";

const STATUS_CONFIG: Record<string, StatusConfig> = {
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
};

export function TablaOperaciones({
  operaciones,
  loading,
  isAdmin,
  onViewDetails,
}: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className={cn("px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider", isAdmin ? "w-1/3" : "w-2/5")}>
                Cliente / Deudor
              </th>
              {isAdmin && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ejecutivo
                </th>
              )}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              /* SKELETON SCREENS (Boneyard) */
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse bg-white">
                  {/* Coluna: Cliente / Deudor */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                  </td>
                  
                  {/* Coluna: Ejecutivo (Apenas Admin) */}
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </div>
                    </td>
                  )}

                  {/* Coluna: Monto */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </td>

                  {/* Coluna: Fecha */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-20 bg-slate-200 rounded"></div>
                      <div className="h-3 w-12 bg-slate-100 rounded"></div>
                    </div>
                  </td>

                  {/* Coluna: Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-7 w-24 bg-slate-200 rounded-full"></div>
                  </td>

                  {/* Coluna: Ações */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="h-8 w-8 bg-slate-200 rounded-full inline-block"></div>
                  </td>
                </tr>
              ))
            ) : operaciones.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="py-16 text-center">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    No hay operaciones para mostrar
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Carga una nueva operación para comenzar.
                  </p>
                </td>
              </tr>
            ) : (
              operaciones.map((op: OperacionDetalle) => {
                const status = STATUS_CONFIG[op.estado] || {
                  label: op.estado || "Desconocido",
                  color: "bg-slate-100 text-slate-700 border-slate-200",
                  icon: FileText,
                };
                const StatusIcon = status.icon;

                return (
                  <tr
                    key={op.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">
                          {op.nombre_cliente}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {op.codigo_operacion}
                        </span>
                      </div>
                    </td>
                    
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {op.nombre_ejecutivo || "Sin Asignar"}
                      </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 text-sm">
                      {op.moneda_sumatoria} {op.monto_sumatoria_total?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700">
                          {new Date(op.fecha_creacion).toLocaleDateString('es-PE')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(op.fecha_creacion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border", status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-brand-600 hover:bg-brand-50"
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