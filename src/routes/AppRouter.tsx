import { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";
import { type Route as SidebarRoute } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROUTES_CONFIG } from "@/config/routes.config";

const ListaOperacionesPage = lazy(() =>
  import("@/pages/operaciones/ListarOperacionesPage").then((m) => ({
    default: m.ListaOperacionesPage,
  })),
);
const NewOperationPage = lazy(() =>
  import("@/pages/nueva-operacion/NewOperationPage").then((m) => ({
    default: m.NewOperationPage,
  })),
);
const EnvioCartasPage = lazy(() =>
  import("@/pages/envio-cartas/EnvioCartasPage").then((m) => ({
    default: m.EnvioCartasPage,
  })),
);
const SunatPage = lazy(() =>
  import("@/pages/sunat/SunatPage").then((m) => ({ default: m.SunatPage })),
);
const IAMPage = lazy(() =>
  import("@/pages/iam/IAMPage").then((m) => ({ default: m.IAMPage })),
);

// Mapeo de IDs de ruta a componentes Lazy
const COMPONENT_MAP: Record<string, React.ElementType> = {
  operations: ListaOperacionesPage,
  "new-operation": NewOperationPage,
  "envio-cartas": EnvioCartasPage,
  sunat: SunatPage,
  iam: IAMPage,
};

function AccesoPendiente() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
      <Card className="border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center max-w-md">
        <ShieldAlert className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Acceso Pendiente</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Tu cuenta ha sido creada exitosamente, pero aún no tienes un rol
          asignado en el sistema.
          <br />
          <br />
          Por favor, comunícate con un administrador para que te otorgue los
          permisos necesarios.
        </p>
      </Card>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  );
}

export function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuth();

  const getCurrentRoute = (): SidebarRoute => {
    const currentRoute = ROUTES_CONFIG.find((r) =>
      location.pathname.startsWith(r.path),
    );
    return currentRoute ? currentRoute.id : "operations"; // Default
  };

  const handleNavigateSidebar = (routeId: string) => {
    const route = ROUTES_CONFIG.find((r) => r.id === routeId);
    if (route) navigate(route.path);
  };

  const hasNoRoles = !authUser?.roles || authUser.roles.length === 0;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<Navigate to="/" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Layout
              currentRoute={getCurrentRoute()}
              onNavigate={handleNavigateSidebar}
            >
              {hasNoRoles ? (
                <AccesoPendiente />
              ) : (
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              )}
            </Layout>
          }
        >
          <Route path="/" element={<Navigate to="/operaciones" replace />} />

          {ROUTES_CONFIG.map((route) => {
            const Component = COMPONENT_MAP[route.id];
            return (
              <Route
                key={route.id}
                element={<RoleGuard allowedRoles={route.roles} />}
              >
                <Route path={route.path} element={<Component />} />
              </Route>
            );
          })}
        </Route>
      </Route>
    </Routes>
  );
}
