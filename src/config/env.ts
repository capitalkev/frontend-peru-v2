export const ENV = {
  API_OPERACIONES: import.meta.env.VITE_API_URL,
  API_IAM: import.meta.env.VITE_IAM_API_URL,
  API_FINANZAS: import.meta.env.VITE_FINANZAS_API_URL,
  SUNAT_API_URL: import.meta.env.VITE_SUNAT_API_URL,
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID,
  COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN,

  API_KEY: import.meta.env.VITE_BACKEND_API_KEY || "123456",
};
