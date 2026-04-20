export interface IAMUser {
  username: string;
  email: string;
  status: string;
  enabled: boolean;
  roles: string[];
}

export const AVAILABLE_ROLES = ["admin", "gestion", "sin_asignar", "ventas"] as const;

export type Role = (typeof AVAILABLE_ROLES)[number];