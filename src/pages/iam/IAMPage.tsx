import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ChevronDown, Search, ShieldAlert } from "lucide-react";
import { IAMService } from "@/features/iam/service/iam.service";
import { AVAILABLE_ROLES } from "@/features/iam/types";
import type { IAMUser, Role } from "@/features/iam/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Importamos Radix UI Dropdown Menu
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function IAMPage() {
  const { authUser } = useAuth();
  // Validamos si tiene el rol de admin dentro de su arreglo de roles
  const isAdmin = authUser?.roles?.includes("admin") || false;

  const [users, setUsers] = useState<IAMUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const data = await IAMService.listUsers();
      setUsers(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isAdmin) {
        if (active) setLoading(false);
        return;
      }
      try {
        const data = await IAMService.listUsers();
        if (active) setUsers(data);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const formatRoleLabel = (role: string) => role.replaceAll("_", " ");

  const handleToggleRole = async (user: IAMUser, role: Role) => {
    const hasRole = user.roles.includes(role);
    setActionLoading(`${user.username}-${role}`);

    try {
      if (role === "sin_asignar") {
        if (!hasRole) {
          const rolesToRemove = user.roles.filter(
            (r): r is Role => r !== "sin_asignar"
          );
          
          for (const r of rolesToRemove) {
            await IAMService.removeRole(user.username, r);
          }
        }
      } else {
        if (hasRole) {
          await IAMService.removeRole(user.username, role);
        } else {
          await IAMService.assignRole(user.username, role);
        }
      }
      
      await loadUsers();
    } catch (err: unknown) {
      console.error(err);
      alert("Error al actualizar roles");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Header title="Gestión de Acceso (IAM)" />
        <Card className="border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center mt-10">
          <ShieldAlert className="h-16 w-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">
            Acceso Restringido
          </h2>
          <p className="text-slate-500 mt-2 text-sm max-w-sm">
            Tu cuenta no cuenta con permisos de administrador. <br />
            No puedes visualizar ni modificar los accesos de otros usuarios.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Gestión de Acceso (IAM)" />

      <div className="flex items-center justify-between">
        <div className="w-full max-w-md">
          <Input
            placeholder="Buscar por correo..."
            icon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-visible">
        {/* El overflow-x-auto ya no cortará el menú gracias al Portal de Radix */}
        <div className="overflow-x-auto pb-4">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Roles Asignados
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Gestionar Roles
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading
                ? [...Array(5).keys()].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={3} className="px-6 py-6">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
                : filteredUsers.map((user) => (
                    <tr
                      key={user.username}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            {user.email}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {user.username}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles.map((r) => (
                            <Badge
                              key={r}
                              variant={
                                r === "admin"
                                  ? "danger"
                                  : r === "sin_asignar"
                                    ? "secondary"
                                    : "info"
                              }
                              className="uppercase text-[10px] tracking-wide"
                            >
                              {formatRoleLabel(r)}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <span className="text-xs text-slate-400 italic">
                              Sin roles
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right align-top">
                        {/* AQUI ESTA LA MEJORA:
                          Uso de Radix UI para asegurar que el Dropdown esté siempre por encima (z-index)
                          y no se vea afectado por el overflow del contenedor padre.
                        */}
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              className={cn(
                                buttonVariants({
                                  variant: "outline",
                                  size: "sm",
                                }),
                                "h-8 px-3 rounded-lg text-[10px] uppercase font-bold select-none gap-2 data-[state=open]:bg-slate-50 data-[state=open]:border-slate-300 focus:outline-none",
                              )}
                            >
                              <span className="inline-flex items-center gap-2">
                                <span>Roles</span>
                                <span className="text-slate-400">
                                  ({user.roles.length})
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                              </span>
                            </button>
                          </DropdownMenu.Trigger>

                          {/* El Portal saca el componente del flujo del DOM para que nada lo corte */}
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="end"
                              sideOffset={8}
                              className="z-50 w-72 rounded-xl border border-slate-200 bg-white shadow-lg p-0 overflow-hidden animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                            >
                              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                  Asignar roles
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {user.roles.length} seleccionados
                                </div>
                              </div>

                              <div className="p-2 max-h-72 overflow-y-auto">
                                {AVAILABLE_ROLES.map((role) => {
                                  const checked = user.roles.includes(role);
                                  const isBusy =
                                    actionLoading ===
                                    `${user.username}-${role}`;

                                  return (
                                    <label
                                      key={role}
                                      className={cn(
                                        "flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-xs transition-colors",
                                        isBusy
                                          ? "opacity-60 cursor-not-allowed"
                                          : "hover:bg-slate-50 cursor-pointer",
                                        checked && !isBusy && "bg-slate-50",
                                      )}
                                      // Evitamos que al hacer click se cierre el dropdown inmediatamente
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span className="font-semibold uppercase text-slate-700">
                                        {formatRoleLabel(role)}
                                      </span>

                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 accent-brand-600 focus:ring-brand-500"
                                        checked={checked}
                                        disabled={isBusy}
                                        onChange={() =>
                                          handleToggleRole(user, role)
                                        }
                                      />
                                    </label>
                                  );
                                })}
                              </div>

                              <div className="px-3 pb-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50/50">
                                Selecciona uno o más roles.
                              </div>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
