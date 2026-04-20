export interface SunatTotalesCurrency {
  totalFacturado: number;
  cantidad: number;
}

export interface SunatTotales {
  PEN: SunatTotalesCurrency;
  USD: SunatTotalesCurrency;
}

export interface Invoice {
  id: string;
  ventaId: string;
  clientId: string;
  clientName: string;
  debtor: string;
  amount: number;
  montoNeto: number;
  currency: "PEN" | "USD";
  emissionDate: string;
  key: string;
  usuario: string;
  tieneNotaCredito: boolean;
}

export interface ClientOption {
  id: string;
  name: string;
  ruc: string;
}

export interface UserOption {
  email: string;
  nombre: string;
  rol?: string;
}
