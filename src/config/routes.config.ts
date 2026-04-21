import { Briefcase, PlusCircle, Menu, FileBarChart, Shield } from "lucide-react";
import type { Route as SidebarRoute } from "@/components/layout/Sidebar";

export interface AppRoute {
  id: SidebarRoute;
  path: string;
  label: string;
  icon: any;
  roles: string[];
  showInSidebar: boolean;
}

export const ROUTES_CONFIG: AppRoute[] = [
  {
    id: "operations",
    path: "/operaciones",
    label: "Mis Operaciones",
    icon: Briefcase,
    roles: ["admin", "ventas", "gestion"],
    showInSidebar: true,
  },
  {
    id: "new-operation",
    path: "/nueva-operacion",
    label: "Nueva Operación",
    icon: PlusCircle,
    roles: ["admin", "ventas", "gestion"],
    showInSidebar: true,
  },
  {
    id: "envio-cartas",
    path: "/envio-cartas",
    label: "Envío de Cartas de Cesión",
    icon: Menu,
    roles: ["admin", "ventas", "gestion"],
    showInSidebar: true,
  },
  {
    id: "sunat",
    path: "/sunat",
    label: "Portal SUNAT",
    icon: FileBarChart,
    roles: ["admin", "ventas", "gestion"],
    showInSidebar: true,
  },
  {
    id: "iam",
    path: "/iam",
    label: "Gestión de Acceso (IAM)",
    icon: Shield,
    roles: ["admin"],
    showInSidebar: true,
  },
];