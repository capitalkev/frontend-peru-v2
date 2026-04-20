import { Card, CardContent } from "@/components/ui/card";
import type { SunatMetrics } from "../types";

const formatCurrency = (value: number, currency: "PEN" | "USD") => {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(
    value,
  );
};

export function KPIDashboard({
  metrics,
  loading,
}: {
  metrics: SunatMetrics;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white rounded-xl border border-slate-200 shadow-sm"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Facturado PEN */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
        <CardContent className="p-5 flex flex-col justify-center h-full">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Facturado (PEN)
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 truncate">
            {formatCurrency(metrics.PEN.totalFacturado, "PEN")}
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-2">
            {metrics.PEN.cantidad} facturas en el periodo
          </p>
        </CardContent>
      </Card>

      {/* Facturado USD */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
        <CardContent className="p-5 flex flex-col justify-center h-full">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Facturado (USD)
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 truncate">
            {formatCurrency(metrics.USD.totalFacturado, "USD")}
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-2">
            {metrics.USD.cantidad} facturas en el periodo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
