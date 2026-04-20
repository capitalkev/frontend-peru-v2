import { motion } from "motion/react";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  UserCircle,
  FileBarChart,
  LogOut,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// 1. INTERFACES Y CONSTANTES
export type Route =
  | "dashboard"
  | "operations"
  | "new-operation"
  | "sunat"
  | "profile"
  | "operation-detail"
  | "envio-cartas";

interface SidebarProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard General", icon: LayoutDashboard },
  { id: "operations", label: "Mis Operaciones", icon: Briefcase },
  { id: "new-operation", label: "Nueva Operación", icon: PlusCircle },
  { id: "envio-cartas", label: "Envío de Cartas de Cesión", icon: Menu },
  { id: "sunat", label: "Portal SUNAT", icon: FileBarChart },
  { id: "profile", label: "Perfil y Scoring", icon: UserCircle },
] as const;

// 2. COMPONENTE
export function Sidebar({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-navy-100 hidden md:flex flex-col shadow-xl shadow-navy-200/20 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      {/* Brand & Toggle */}
      <div
        className={cn(
          "p-4 flex items-center",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {!isCollapsed && (
          <span className="text-xl font-bold text-navy-900 tracking-tight">
            <img
              src="/src/assets/capitalexpress.png"
              alt="Logo"
              className="h-8"
            />
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto hide-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive =
            currentRoute === item.id ||
            (currentRoute === "operation-detail" && item.id === "operations");
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Route)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center p-3 rounded-xl transition-all duration-200 group font-medium w-full",
                isCollapsed ? "justify-center" : "justify-start",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50"
                  : "text-navy-500 hover:bg-navy-50 hover:text-navy-900",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-brand-600"
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors shrink-0",
                  !isCollapsed && "mr-3",
                  isActive
                    ? "text-brand-600"
                    : "text-navy-400 group-hover:text-navy-600",
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-brand-400 opacity-50 shrink-0" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-slate-100">
        <button
          onClick={logout}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={cn(
            "flex items-center w-full px-2 py-2 text-navy-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}
