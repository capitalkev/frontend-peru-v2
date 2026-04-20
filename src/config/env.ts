export const ENV = {
  API_OPERACIONES: import.meta.env.VITE_API_URL || "http://localhost:8000",
  API_IAM: import.meta.env.VITE_IAM_API_URL || "http://localhost:8080",
  API_FINANZAS: import.meta.env.VITE_FINANZAS_API_URL || "http://localhost:9000",
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID,
  COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN,
};