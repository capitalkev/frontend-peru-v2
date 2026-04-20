import { fetchAuthSession } from "aws-amplify/auth";
import { ENV } from "@/config/env";

export async function getAuthHeaders(isFormData = false): Promise<HeadersInit> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) throw new Error("No hay usuario autenticado en Cognito");

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${token}`,
    "X-API-KEY": ENV.API_KEY,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}