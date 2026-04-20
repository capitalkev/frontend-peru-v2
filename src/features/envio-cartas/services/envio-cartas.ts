import { getAuthHeaders } from "@/api/apiClient";
import { ENV } from "@/config/env";

export const EnvioCartasService = {
  procesarExcelCesion: async (file: File, fechaIngreso: string) => {
    const headers = await getAuthHeaders(true);
    const formData = new FormData();
    formData.append("excel", file);
    formData.append("fecha_ingreso_desde", fechaIngreso);

    const response = await fetch(`${ENV.API_FINANZAS}/finanzas/extract`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) throw new Error("Error al procesar Excel");
    return response.json();
  },

  enviarCartasCesion: async (pdfs: File[], datosEnvio: any[], fechaCarpeta: string) => {
    const headers = await getAuthHeaders(true);
    const formData = new FormData();

    pdfs.forEach((file) => formData.append("pdfs", file));
    formData.append("datos_envio", JSON.stringify(datosEnvio));
    formData.append("fecha_carpeta", fechaCarpeta);

    const response = await fetch(`${ENV.API_FINANZAS}/finanzas/enviar-cartas`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) throw new Error("Error al enviar cartas");
    return response.json();
  },

  getContactos: async (ruc_deudor: string): Promise<{ email: string }[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${ENV.API_OPERACIONES}/contactos/${ruc_deudor}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) return [];
    return response.json();
  },

  addContacto: async (ruc_deudor: string, email: string) => {
    const headers = await getAuthHeaders();
    await fetch(`${ENV.API_OPERACIONES}/contactos/${ruc_deudor}/${email}`, {
      method: "POST",
      headers,
    });
  },

  deleteContacto: async (ruc_deudor: string, email: string) => {
    const headers = await getAuthHeaders();
    await fetch(`${ENV.API_OPERACIONES}/contactos/${ruc_deudor}/${email}`, {
      method: "DELETE",
      headers,
    });
  },
};