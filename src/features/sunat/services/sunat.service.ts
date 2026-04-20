import { getAuthHeaders } from "@/api/apiClient";
import { ENV } from "@/config/env";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(
      "El servidor está apagado o no devolvió una respuesta válida.",
    );
  }
};

export const SunatService = {
  getUsers: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${ENV.API_IAM}/api/admin/usuarios/`, {
      headers,
    });
    return handleResponse(response);
  },

  getClients: async (queryString: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${ENV.SUNAT_API_URL}/api/ventas/empresas${queryString}`,
      { headers },
    );
    return handleResponse(response);
  },

  getResumen: async (queryString: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${ENV.SUNAT_API_URL}/api/ventas/resumen?${queryString}`,
      { headers },
    );
    return handleResponse(response);
  },

  getVentas: async (queryString: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${ENV.SUNAT_API_URL}/api/ventas?${queryString}`,
      { headers },
    );
    return handleResponse(response);
  },
};
