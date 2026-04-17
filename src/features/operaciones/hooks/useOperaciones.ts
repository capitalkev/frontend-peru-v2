// src/features/operaciones/hooks/useOperaciones.ts
import { useState, useEffect } from 'react';
import { OperacionesService } from '../services/operaciones.service';
import { OperacionDetalle } from '../types';

export function useMisOperaciones(email?: string) {
  const [operaciones, setOperaciones] = useState<OperacionDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await OperacionesService.getOperations(email);
        // Nos aseguramos de que siempre sea un array
        setOperaciones(Array.isArray(data) ? data : [data]);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [email]);

  return { operaciones, loading, error };
}