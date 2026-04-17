import { fetchAuthSession } from "aws-amplify/auth";

// Esta función extrae el Token JWT de Cognito para inyectarlo en las peticiones
export async function getAuthHeaders(isFormData = false): Promise<HeadersInit> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) throw new Error("No hay usuario autenticado en Cognito");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}