import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Invoice } from "../types";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number, currency: "PEN" | "USD") => {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(value);
};

// --- TABLA DETALLADA CON SKELETON ---
export function DetailedTable({ invoices, loading }: { invoices: Invoice[]; loading?: boolean }) {
  return (
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50/50">
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Factura</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente / Deudor</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Emisión</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          // Skeleton para Tabla Detallada
          Array.from({ length: 8 }).map((_, i) => (
            <tr key={`skeleton-det-${i}`} className="animate-pulse bg-white">
              <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-48 bg-slate-200 rounded"></div>
                  <div className="h-3 w-32 bg-slate-100 rounded"></div>
                </div>
              </td>
              <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
              <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded"></div></td>
            </tr>
          ))
        ) : invoices.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-16 text-center text-slate-400">No se encontraron facturas.</td>
          </tr>
        ) : (
          invoices.map((inv: Invoice) => {
            const isZeroAmount = inv.montoNeto === 0;
            return (
              <tr key={inv.key} className={cn("hover:bg-slate-50/50 transition-colors", isZeroAmount && "opacity-50 bg-slate-50")}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-slate-700">{inv.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-slate-800">{inv.clientName}</span>
                    <span className="text-xs text-slate-500 truncate max-w-[300px]">{inv.debtor}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-mono font-medium text-slate-700">
                    {formatCurrency(inv.amount, inv.currency)}
                  </span>
                  {isZeroAmount && (
                    <span className="ml-2 text-[10px] font-medium text-slate-500 uppercase bg-slate-200 px-1.5 py-0.5 rounded">Anulada</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                  {inv.emissionDate}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

// --- TABLA AGRUPADA CON SKELETON ---
export function GroupedTable({ groups, expandedKey, onExpand, loading }: any) {
  return (
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50/80">
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deudor</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Facturas</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Monto Total</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          // Skeleton para Tabla Agrupada
          Array.from({ length: 6 }).map((_, i) => (
            <tr key={`skeleton-grp-${i}`} className="animate-pulse border-b border-slate-100 bg-white">
              <td className="px-4 py-5"><div className="h-4 w-40 bg-slate-200 rounded"></div></td>
              <td className="px-4 py-5"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
              <td className="px-4 py-5 text-center"><div className="h-5 w-8 bg-slate-200 rounded-full mx-auto"></div></td>
              <td className="px-4 py-5 text-right"><div className="h-4 w-24 bg-slate-200 rounded ml-auto"></div></td>
            </tr>
          ))
        ) : (
          groups.map((group: any) => {
            const isExpanded = expandedKey === group.key;
            return (
              <React.Fragment key={group.key}>
                <tr 
                  className={cn("border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer", isExpanded && "bg-brand-50/30")}
                  onClick={() => onExpand(group.key)}
                >
                  <td className="px-4 py-3 font-medium text-sm text-slate-800">{group.clientName}</td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{group.debtor}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                      {group.invoiceCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-sm text-slate-800">
                    <div className="flex items-center justify-end gap-2">
                      {formatCurrency(group.totalAmount, group.currency)}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={4} className="p-0 border-b border-slate-200">
                      <div className="bg-slate-50/80 px-6 py-3 shadow-inner">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="pb-2 text-xs font-semibold text-slate-400">Factura</th>
                              <th className="pb-2 text-xs font-semibold text-slate-400">Monto</th>
                              <th className="pb-2 text-xs font-semibold text-slate-400">Emisión</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/50">
                            {group.invoices.map((inv: Invoice) => (
                              <tr key={inv.key} className={cn("hover:bg-white transition-colors", inv.montoNeto === 0 && "opacity-50")}>
                                <td className="py-2 text-xs font-medium text-slate-700">{inv.id}</td>
                                <td className="py-2 text-xs font-mono text-slate-600">{formatCurrency(inv.amount, inv.currency)}</td>
                                <td className="py-2 text-xs text-slate-500">{inv.emissionDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
      </tbody>
    </table>
  );
}