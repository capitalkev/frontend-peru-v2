// src/features/nueva-operacion/types.ts

export interface ExtractedDocument {
  document_id: string;
  issue_date: string;
  due_date: string;
  currency: string;
  total_amount: number;
  net_amount: number;
  debtor_name: string;
  debtor_ruc: string;
  client_name: string;
  client_ruc: string;
  valid: boolean;
  source_filename: string;
  error?: string;
}

export interface Debtor {
  id: string;
  name: string;
  xmlCount: number;
  emails: string[];
  sustentos: File[];
  documents: ExtractedDocument[];
}

export interface FrontendData {
  condiciones: {
    tasa: number;
    comision: number;
  };
  notificaciones: {
    nombre_cliente: string;
    ruc_cliente: string;
    correo_remitente: string;
    envio_conjunto: boolean;
    emails_globales: string[];
    deudores: {
      id: string;
      nombre: string;
      emails: string[];
      documentos: ExtractedDocument[];
      sustentos: string[];
    }[];
  };
  cierre: {
    comentario: string;
    solicita_adelanto: boolean;
    porcentaje_adelanto: number;
    cuenta_desembolso: {
      banco: string;
      tipo_cuenta: string;
      moneda: string;
      numero_cuenta: string;
    };
  };
}
