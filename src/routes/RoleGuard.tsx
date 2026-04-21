import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RoleGuardProps {
  allowedRoles: string[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { authUser, loading } = useAuth();

  if (loading) return null;
  const hasAccess = authUser?.roles.some(rol => allowedRoles.includes(rol));

  if (!authUser || !hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center max-w-md">
          <ShieldAlert className="h-16 w-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Acceso Restringido</h2>
          <p className="text-slate-500 mt-2 text-sm">
            No tienes los permisos necesarios para ver esta página.
          </p>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}