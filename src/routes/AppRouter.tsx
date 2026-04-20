import { Routes, Route, useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { type Route as SidebarRoute } from "@/components/layout/Sidebar";

// Importa tus nuevas páginas aquí
import { ListaOperacionesPage } from "@/pages/operaciones/ListarOperacionesPage";
//import { OperationDetailPage } from "@/pages/operaciones/OperationDetailPage";
//import { NewOperationView } from "@/pages/nueva-operacion/NewOperationView";
//import { EnvioCartasView } from "@/pages/envio-cartas/EnvioCartasView";
//import { SunatView } from "@/pages/sunat/SunatView";
//import { ProfilePage } from "@/pages/perfil/ProfilePage";

export function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentRoute = (): SidebarRoute => {
    const path = location.pathname;
    if (path.includes('/operacion/')) return "operation-detail";
    if (path.startsWith("/operaciones")) return "operations";
    if (path === '/nueva-operacion') return "new-operation";
    if (path === '/envio-cartas') return "envio-cartas";
    if (path === '/sunat') return "sunat";
    if (path === '/perfil') return "profile";
    return "dashboard";
  };

  const handleNavigateSidebar = (route: string) => {
    const paths = {
      "operations": "/operaciones",
      "new-operation": "/nueva-operacion",
      "sunat": "/sunat",
      "profile": "/perfil",
      "envio-cartas": "/envio-cartas",
    };
    navigate(paths[route as keyof typeof paths] || "/");
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<Navigate to="/" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={
          <Layout currentRoute={getCurrentRoute()} onNavigate={handleNavigateSidebar}>
            <Outlet />
          </Layout>
        }>
          <Route path="/operaciones" element={<ListaOperacionesPage />} />
          {/* <Route path="/operacion/:id" element={<OperationDetailPage />} /> */}
          {/* <Route path="/nueva-operacion" element={<NewOperationView onFinish={() => navigate("/operaciones")} />} /> */}
          {/* <Route path="/envio-cartas" element={<EnvioCartasView />} /> */}
          {/* <Route path="/sunat" element={<SunatView />} /> */}
          {/* <Route path="/perfil" element={<ProfilePage />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}