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
import { type Route as SidebarRoute } from "@/components/layout/Sidebar";

export function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentRoute = (): SidebarRoute => {
    const path = location.pathname;
    if (path.startsWith("/operaciones")) return "operations";
    return "dashboard";
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<Navigate to="/" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Layout
              currentRoute={getCurrentRoute()}
              onNavigate={(r) => navigate(r === "dashboard" ? "/" : `/${r}`)}
            >
              <Outlet />
            </Layout>
          }
        >
          <Route path="/" element={<div>Dashboard Principal</div>} />
          <Route path="/operations" element={<div>Lista de Operaciones</div>} />
        </Route>
      </Route>
    </Routes>
  );
}
