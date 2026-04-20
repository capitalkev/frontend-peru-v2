import { useState, useEffect, useMemo } from "react";
import { SunatService } from "../services/sunat.service";
import type { ClientOption, UserOption, SunatMetrics } from "../types";

export function useSunatUsers(isAuthenticated: boolean, isAdmin: boolean) {
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    SunatService.getUsers()
      .then(data => setUsers(data.map((u: any) => ({ 
         email: u.email, 
         nombre: u.email,
         rol: u.roles && u.roles.length > 0 ? u.roles[0] : "sin_asignar"
      }))))
      .catch(err => console.error("Error fetching users:", err));
  }, [isAuthenticated, isAdmin]);

  return { users };
}

export function useSunatClients(
  isAuthenticated: boolean,
  selectedEmails: string[],
  allUsersLength: number,
) {
  const [clients, setClients] = useState<ClientOption[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let queryString = "";
    const shouldFilter =
      selectedEmails.length > 0 && selectedEmails.length <= allUsersLength;
    if (shouldFilter) {
      queryString = `?${selectedEmails.map((e) => `usuario_emails=${e}`).join("&")}`;
    }

    SunatService.getClients(queryString)
      .then((data) => {
        const uniqueClientsMap = new Map();
        data.forEach((e: any) => {
          if (!uniqueClientsMap.has(e.ruc)) {
            uniqueClientsMap.set(e.ruc, {
              id: e.ruc,
              name: e.razon_social || "Sin Nombre",
              ruc: e.ruc,
            });
          } else if (
            e.razon_social &&
            uniqueClientsMap.get(e.ruc).name === "Sin Nombre"
          ) {
            uniqueClientsMap.get(e.ruc).name = e.razon_social;
          }
        });
        setClients(Array.from(uniqueClientsMap.values()));
      })
      .catch((err) => console.error("Error fetching clients:", err));
  }, [isAuthenticated, selectedEmails, allUsersLength]);

  return { clients };
}

export function useSunatData(
  isAuthenticated: boolean,
  dateFilter: { type: string; start?: string; end?: string },
  selectedClientIds: string[],
  selectedCurrencies: string[],
  selectedUserEmails: string[],
  currentPage: number,
  sortBy: string,
  clientsLength: number,
  usersLength: number,
  viewMode: string,
  refreshTrigger: number,
) {
  const [ventas, setVentas] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<SunatMetrics>({
    PEN: {
      totalFacturado: 0,
      montoGanado: 0,
      montoDisponible: 0,
      cantidad: 0,
      winPercentage: 0,
    },
    USD: {
      totalFacturado: 0,
      montoGanado: 0,
      montoDisponible: 0,
      cantidad: 0,
      winPercentage: 0,
    },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total_items: 0,
    has_next: false,
    has_previous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);
    let label = "Mes en curso";

    if (dateFilter.type === "5days") {
      start.setDate(today.getDate() - 5);
      label = "Últimos 5 días";
    } else if (dateFilter.type === "15days") {
      start.setDate(today.getDate() - 15);
      label = "Últimos 15 días";
    } else if (dateFilter.type === "30days") {
      start.setDate(today.getDate() - 30);
      label = "Últimos 30 días";
    } else if (dateFilter.type === "custom") {
      start = new Date(dateFilter.start!);
      end = new Date(dateFilter.end!);
      label = `Del ${dateFilter.start} al ${dateFilter.end}`;
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      label = start
        .toLocaleString("es-ES", { month: "long", year: "numeric" })
        .replace(/^\w/, (c) => c.toUpperCase());
    }

    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
      periodLabel: label,
    };
  }, [dateFilter]);

  const buildParams = (isMetrics = false) => {
    const params = new URLSearchParams({
      fecha_desde: startDate,
      fecha_hasta: endDate,
    });
    if (!isMetrics) {
      params.append("page", String(currentPage));
      params.append("page_size", viewMode === "grouped" ? "100" : "20");
      params.append("sort_by", sortBy);
    }
    selectedCurrencies.forEach((c) => params.append("moneda", c));
    if (
      selectedClientIds.length > 0 &&
      selectedClientIds.length < clientsLength
    ) {
      selectedClientIds.forEach((ruc) => params.append("rucs_empresa", ruc));
    }
    if (
      selectedUserEmails.length > 0 &&
      selectedUserEmails.length <= usersLength
    ) {
      selectedUserEmails.forEach((email) =>
        params.append("usuario_emails", email),
      );
    }
    return params.toString();
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsData, salesData] = await Promise.all([
          SunatService.getMetrics(buildParams(true)),
          SunatService.getVentas(buildParams(false)),
        ]);

        const calcMetrics = (data: any) => {
          const res = { PEN: data.PEN || {}, USD: data.USD || {} };
          res.PEN.winPercentage =
            res.PEN.totalFacturado > 0
              ? (res.PEN.montoGanado / res.PEN.totalFacturado) * 100
              : 0;
          res.USD.winPercentage =
            res.USD.totalFacturado > 0
              ? (res.USD.montoGanado / res.USD.totalFacturado) * 100
              : 0;
          return res as SunatMetrics;
        };

        setMetrics(calcMetrics(metricsData));
        setVentas(salesData.items || []);
        setPagination(salesData.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    isAuthenticated,
    startDate,
    endDate,
    currentPage,
    viewMode,
    sortBy,
    selectedClientIds,
    selectedCurrencies,
    selectedUserEmails,
    refreshTrigger,
  ]);

  return { ventas, metrics, pagination, loading, error, periodLabel };
}
