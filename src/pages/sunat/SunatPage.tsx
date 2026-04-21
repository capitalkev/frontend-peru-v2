import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, AlertTriangle, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";

import { ResumenDashboard } from "@/features/sunat/components/ResumenDashboard";
import {
  ClientFilter,
  CurrencyFilter,
  UserFilter,
  PeriodFilter,
} from "@/features/sunat/components/Filters";
import {
  DetailedTable,
  GroupedTable,
} from "@/features/sunat/components/Tables";
import {
  useSunatUsers,
  useSunatClients,
  useSunatData,
} from "@/features/sunat/hooks/useSunat";

export function SunatPage() {
  const { authUser, loading: authLoading } = useAuth();
  const isAdmin = authUser?.roles?.includes("admin") || false;
  const isAuthenticated = !!authUser;

  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState({ type: "thisMonth" });

  const [viewMode, setViewMode] = useState<"grouped" | "detailed">("grouped");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  const { users } = useSunatUsers(isAuthenticated, isAdmin);
  const { clients } = useSunatClients(
    isAuthenticated,
    selectedUserEmails,
    users.length,
  );

  const { ventas, totales, pagination, loading, error } = useSunatData(
    isAuthenticated,
    dateFilter,
    selectedClientIds,
    selectedCurrencies,
    selectedUserEmails,
    currentPage,
    "fecha",
    clients.length,
    users.length,
    viewMode,
    0,
  );

  const invoicesFormatted = useMemo(
    () =>
      ventas.map((v) => ({
        id: `${v.serie_cdp || ""}-${v.nro_cp_doc || v.id}`,
        ventaId: v.id,
        clientId: v.ruc,
        clientName: v.razon_social || v.ruc,
        debtor: v.cliente_razon_social || "Sin nombre",
        amount: parseFloat(v.total_factura || 0),
        montoNeto: parseFloat(v.monto_neto || 0),
        currency: v.moneda,
        emissionDate: v.fecha_emision,
        key: `${v.ruc}-${v.serie_cdp || ""}-${v.nro_cp_doc || v.id}`,
        tieneNotaCredito: v.tiene_nota_credito,
        usuario: v.usuario,
      })),
    [ventas],
  );

  const groupsFormatted = useMemo(() => {
    const groupsMap = invoicesFormatted.reduce((acc: any, inv: any) => {
      const key = `${inv.clientId}-${inv.debtor}-${inv.currency}`;
      if (!acc[key])
        acc[key] = {
          key,
          clientName: inv.clientName,
          debtor: inv.debtor,
          currency: inv.currency,
          invoiceCount: 0,
          totalAmount: 0,
          invoices: [],
        };
      acc[key].invoiceCount++;
      acc[key].totalAmount += inv.montoNeto;
      acc[key].invoices.push(inv);
      return acc;
    }, {});
    return Object.values(groupsMap);
  }, [invoicesFormatted]);

  if (authLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-brand-600 h-8 w-8" />
      </div>
    );

  if (error && ventas.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-2rem)] space-y-4">
        <Header title="Portal SUNAT" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="border-rose-200 bg-rose-50 p-8 text-center max-w-md shadow-sm">
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-rose-900 mb-2">
              Error de Conexión
            </h2>
            <p className="text-rose-700 font-medium mb-6 text-xs">
              {error.includes("Failed to fetch")
                ? "No se pudo conectar con el servidor de SUNAT. Verifica tu conexión."
                : error}
            </p>
            <Button
              variant="destructive"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] space-y-4">
      <Header title="Portal SUNAT" />

      {/* KPIs con soporte de loading/skeleton */}
      <div className="shrink-0 mt-2">
        <ResumenDashboard
          totales={totales}
          loading={loading && ventas.length === 0}
        />
      </div>

      <Card className="flex-1 border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white min-h-[300px] rounded-xl">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode("grouped")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === "grouped" ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-slate-900"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Agrupada
              </button>
              <button
                onClick={() => setViewMode("detailed")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === "detailed" ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-slate-900"}`}
              >
                <List className="w-3.5 h-3.5" /> Detallada
              </button>
            </div>
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>
            <ClientFilter
              clients={clients}
              selected={selectedClientIds}
              onChange={(ids) => {
                setSelectedClientIds(ids);
                setCurrentPage(1);
              }}
            />
            <CurrencyFilter
              selected={selectedCurrencies}
              onChange={(curr) => {
                setSelectedCurrencies(curr);
                setCurrentPage(1);
              }}
            />
            {isAdmin && (
              <UserFilter
                users={users}
                selected={selectedUserEmails}
                onChange={(emails) => {
                  setSelectedUserEmails(emails);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <PeriodFilter
              filter={dateFilter}
              onChange={(f: any) => {
                setDateFilter(f);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Contenedor de la Tabla con Skeleton Screens */}
        <div className="flex-1 overflow-auto bg-white">
          {viewMode === "grouped" ? (
            <GroupedTable
              groups={groupsFormatted}
              expandedKey={expandedGroupKey}
              onExpand={(key: string) =>
                setExpandedGroupKey((prev) => (prev === key ? null : key))
              }
              loading={loading && ventas.length === 0}
            />
          ) : (
            <DetailedTable
              invoices={invoicesFormatted}
              loading={loading && ventas.length === 0}
            />
          )}
        </div>

        {/* Paginación */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <span className="text-xs font-medium text-slate-500">
            Página {pagination.page} de {pagination.total_pages}{" "}
            <span className="text-slate-400 font-normal">
              ({pagination.total_items} facturas)
            </span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white h-8 text-xs"
              disabled={!pagination.has_previous}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white h-8 text-xs"
              disabled={!pagination.has_next}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
