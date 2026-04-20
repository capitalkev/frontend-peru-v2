import { getAuthHeaders } from "@/api/apiClient";
import { ENV } from "@/config/env";
import type { OperacionDetalle } from "@/features/operaciones/types";

export const OperacionesService = {
  // Obtener lista de operaciones del usuario
  getOperations: async (email: string): Promise<OperacionDetalle[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${ENV.API_OPERACIONES}/operaciones/${email}`,
      {
        method: "GET",
        headers,
      },
    );
    if (!response.ok) throw new Error("Error al obtener operaciones");
    return response.json();
  },

  // Obtener facturas de una operación (Para la vista de detalle)
  getFacturasByOperation: async (idOperacion: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${ENV.API_OPERACIONES}/operaciones/facturas/${idOperacion}`,
      {
        method: "GET",
        headers,
      },
    );
    if (!response.ok) throw new Error("Error al obtener facturas");
    return response.json();
  },
};
