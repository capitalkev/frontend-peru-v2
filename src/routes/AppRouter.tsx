import { Routes, Route, useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";
import { type Route as SidebarRoute } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

import { ListaOperacionesPage } from "@/pages/operaciones/ListarOperacionesPage";
import { NewOperationPage } from "@/pages/nueva-operacion/NewOperationPage";
import { EnvioCartasPage } from "@/pages/envio-cartas/EnvioCartasPage";
import { SunatPage } from "@/pages/sunat/SunatPage";
import { IAMPage } from "@/pages/iam/IAMPage";
import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

function AccesoPendiente() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
      <Card className="border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center max-w-md">
        <ShieldAlert className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Acceso Pendiente</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Tu cuenta ha sido creada exitosamente, pero aún no tienes un rol asignado en el sistema.<br /><br />
          Por favor, comunícate con un administrador para que te otorgue los permisos necesarios.
        </p>
      </Card>
    </div>
  );
}

export function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuth();

  const getCurrentRoute = (): SidebarRoute => {
    const path = location.pathname;
    if (path.startsWith("/operaciones")) return "operations";
    if (path === '/nueva-operacion') return "new-operation";
    if (path === '/envio-cartas') return "envio-cartas";
    if (path === '/sunat') return "sunat";
    if (path === '/iam') return "iam";
    return "dashboard";
  };

  const handleNavigateSidebar = (route: string) => {
    const paths = {
      "operations": "/operaciones",
      "new-operation": "/nueva-operacion",
      "sunat": "/sunat",
      "envio-cartas": "/envio-cartas",
      "iam": "/iam",
    };
    navigate(paths[route as keyof typeof paths] || "/");
  };

  const isSinAsignar = authUser?.rol === "sin_asignar";

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<Navigate to="/" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={
          <Layout currentRoute={getCurrentRoute()} onNavigate={handleNavigateSidebar}>
            {isSinAsignar ? <AccesoPendiente /> : <Outlet />}
          </Layout>
        }>
          <Route path="/" element={<Navigate to="/operaciones" replace />} />
          
          <Route element={<RoleGuard allowedRoles={["admin", "ventas", "gestion"]} />}>
            <Route path="/operaciones" element={<ListaOperacionesPage />} />
            <Route path="/nueva-operacion" element={<NewOperationPage />} />
            <Route path="/envio-cartas" element={<EnvioCartasPage />} />
            <Route path="/sunat" element={<SunatPage />} />
          </Route>

          {/* Rutas exclusivas para admin */} 
          <Route element={<RoleGuard allowedRoles={["admin"]} />}>
            <Route path="/iam" element={<IAMPage />} />
          </Route>

        </Route>
      </Route>
    </Routes>
  );
}