import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppRouter } from "@/routes/AppRouter";
import { configureAmplify } from "@/config/amplify";

// 1. Inicializamos la configuración de AWS Cognito/Amplify al arrancar la app
configureAmplify();

/**
 * App.tsx: Orquestador de Providers
 * En esta arquitectura, este archivo no contiene rutas ni lógica de negocio.
 * Solo envuelve la aplicación en los contextos necesarios.
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Proveedor de autenticación que maneja el estado de Cognito globalmente */}
      <AuthProvider>
        {/* El enrutador que decide qué página mostrar según la URL */}
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
