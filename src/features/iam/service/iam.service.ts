import { getAuthHeaders } from "@/api/apiClient";
import { ENV } from "@/config/env";
import type { IAMUser } from "../types";

export const IAMService = {
  // Listar todos los usuarios
  listUsers: async (): Promise<IAMUser[]> => {
    const headers = await getAuthHeaders();
    const url = `${ENV.API_IAM}/api/admin/usuarios/`;
    const response = await fetch(url, {
      headers,
    });
    if (!response.ok) {
      let details = "";
      try {
        const text = await response.text();
        details = text ? ` - ${text.slice(0, 500)}` : "";
      } catch {
        // ignore
      }
      throw new Error(
        `Error al obtener usuarios (${response.status} ${response.statusText}) - ${url}${details}`,
      );
    }
    return response.json();
  },

  // Asignar un nuevo rol
  assignRole: async (username: string, role: string) => {
    const headers = await getAuthHeaders();
    const url = `${ENV.API_IAM}/api/admin/usuarios/${username}/roles/${role}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
    });
    if (!response.ok) {
      let details = "";
      try {
        const text = await response.text();
        details = text ? ` - ${text.slice(0, 500)}` : "";
      } catch {
        // ignore
      }
      throw new Error(
        `No se pudo asignar el rol (${response.status} ${response.statusText}) - ${url}${details}`,
      );
    }
  },

  // Quitar un rol
  removeRole: async (username: string, role: string) => {
    const headers = await getAuthHeaders();
    const url = `${ENV.API_IAM}/api/admin/usuarios/${username}/roles/${role}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      let details = "";
      try {
        const text = await response.text();
        details = text ? ` - ${text.slice(0, 500)}` : "";
      } catch {
        // ignore
      }
      throw new Error(
        `No se pudo quitar el rol (${response.status} ${response.statusText}) - ${url}${details}`,
      );
    }
  },

  // Eliminar usuario completamente
  deleteUser: async (email: string) => {
    const headers = await getAuthHeaders();
    const url = `${ENV.API_IAM}/api/admin/usuarios/${email}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      let details = "";
      try {
        const text = await response.text();
        details = text ? ` - ${text.slice(0, 500)}` : "";
      } catch {
        // ignore
      }
      throw new Error(
        `No se pudo eliminar el usuario (${response.status} ${response.statusText}) - ${url}${details}`,
      );
    }
  },
};
