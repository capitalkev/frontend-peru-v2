// src/features/operaciones/types.ts

export interface OperacionDetalle {
  id: string;
  codigo_operacion: string;
  nombre_cliente: string;
  cliente_ruc?: string;
  nombre_ejecutivo?: string;
  moneda_sumatoria: string;
  monto_sumatoria_total: number;
  fecha_creacion: string;
  estado: string;
}