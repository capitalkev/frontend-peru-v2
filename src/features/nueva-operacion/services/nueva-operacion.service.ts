// src/features/nueva-operacion/services/nueva-operacion.service.ts
import { getAuthHeaders } from "@/api/apiClient";
import { ENV } from "@/config/env";
import type { ExtractedDocument, FrontendData } from "../types";

export const NuevaOperacionService = {
  extractDebtors: async (files: File[]): Promise<ExtractedDocument[]> => {
    const headers = await getAuthHeaders(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("xml_files", file));

    const response = await fetch(
      `${ENV.API_OPERACIONES}/robot/extraer-deudores`,
      {
        method: "POST",
        headers,
        body: formData,
      },
    );

    if (!response.ok) throw new Error("Error al extraer deudores");
    return response.json();
  },

  getContactos: async (ruc_deudor: string): Promise<{ email: string }[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${ENV.API_OPERACIONES}/contactos/${ruc_deudor}`,
      {
        method: "GET",
        headers,
      },
    );
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

  processOperation: async (
    frontendData: FrontendData,
    xmlFiles: File[],
    sustentos: File[],
    additionalDocs: File[],
  ) => {
    const headers = await getAuthHeaders(true);
    const formData = new FormData();
    formData.append("data_frontend", JSON.stringify(frontendData));

    xmlFiles.forEach((file) => formData.append("xml_files", file));
    sustentos.forEach((file) => formData.append("pdf_files", file));
    additionalDocs.forEach((file) => formData.append("respaldo_files", file));

    const response = await fetch(
      `${ENV.API_OPERACIONES}/robot/procesar-completa`,
      {
        method: "POST",
        headers,
        body: formData,
      },
    );

    if (!response.ok)
      throw new Error("Error al procesar la operación completa");
    return response.json();
  },
};
