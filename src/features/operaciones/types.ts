import type { LucideIcon } from "lucide-react";

export interface OperacionDetalle {
  id: string;
  codigo_operacion: string;
  nombre_cliente: string;
  cliente_ruc: string;
  nombre_ejecutivo: string;
  moneda_sumatoria: string;
  monto_sumatoria_total: number;
  fecha_creacion: string;
  estado: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}