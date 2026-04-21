import { useEffect, useRef, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth"; // <-- Importamos useAuth

export function IAMPage() {
  // 1. Obtenemos el usuario actual y verificamos si es admin
  const { authUser } = useAuth();
  const isAdmin = authUser?.rol === "admin";

  const [users, setUsers] = useState<IAMUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [openUser, setOpenUser] = useState<string | null>(null);
  const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
  const containerRefs = useRef(new Map<string, HTMLDivElement | null>());
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | null>());

  const loadUsers = async () => {
    if (!isAdmin) return; // Si no es admin, no hacemos la petición al backend
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
      // 2. Bloqueamos la petición inicial si no tiene permisos
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
  }, [isAdmin]); // <-- Agregamos isAdmin a las dependencias

  const formatRoleLabel = (role: string) => role.replaceAll("_", " ");

  const handleToggleRole = async (user: IAMUser, role: Role) => {
    const hasRole = user.roles.includes(role);
    setActionLoading(`${user.username}-${role}`);

    try {
      if (role === "sin_asignar") {
        if (hasRole) {
          await IAMService.removeRole(user.username, role);
        } else {
          const rolesToRemove = user.roles.filter(
            (r): r is Role =>
              (AVAILABLE_ROLES as readonly string[]).includes(r) &&
              r !== "sin_asignar",
          );

          for (const r of rolesToRemove) {
            await IAMService.removeRole(user.username, r);
          }
          await IAMService.assignRole(user.username, role);
        }
      } else {
        if (hasRole) {
          await IAMService.removeRole(user.username, role);
        } else {
          if (user.roles.includes("sin_asignar")) {
            await IAMService.removeRole(user.username, "sin_asignar");
          }
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

  useEffect(() => {
    if (!openUser) return;
    const onPointerDown = (event: MouseEvent) => {
      const container = containerRefs.current.get(openUser);
      if (!container) return;
      if (!container.contains(event.target as Node)) setOpenUser(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenUser(null);
    };
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openUser]);

  const toggleDropdownFor = (username: string) => {
    if (openUser === username) {
      setOpenUser(null);
      return;
    }
    const trigger = triggerRefs.current.get(username);
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUp = spaceBelow < 340 && spaceAbove > spaceBelow;
      setOpenDirection(shouldOpenUp ? "up" : "down");
    } else {
      setOpenDirection("down");
    }
    setOpenUser(username);
  };

  // 3. VISTA "VACÍA" PARA USUARIOS SIN PERMISOS
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
            Tu cuenta actual tiene el rol{" "}
            <strong>{formatRoleLabel(authUser?.rol || "sin rol")}</strong> y no
            cuenta con permisos de administrador. <br />
            <br />
            No puedes visualizar ni modificar los accesos de otros usuarios.
          </p>
        </Card>
      </div>
    );
  }

  // 4. VISTA NORMAL (Para administradores)
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
            {/* ... Todo el resto del contenido de la tabla queda exactamente igual ... */}
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
                        <div
                          ref={(el) => {
                            containerRefs.current.set(user.username, el);
                          }}
                          className="relative inline-flex justify-end text-left"
                        >
                          <button
                            ref={(el) => {
                              triggerRefs.current.set(user.username, el);
                            }}
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={openUser === user.username}
                            onClick={() => toggleDropdownFor(user.username)}
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "sm",
                              }),
                              "h-8 px-3 rounded-lg text-[10px] uppercase font-bold select-none",
                              "gap-2",
                              openUser === user.username &&
                                "bg-slate-50 border-slate-300",
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

                          {openUser === user.username && (
                            <div
                              role="menu"
                              className={cn(
                                "absolute right-0 z-20 w-72 rounded-xl border border-slate-200 bg-white shadow-sm",
                                openDirection === "down"
                                  ? "top-full mt-2"
                                  : "bottom-full mb-2",
                              )}
                            >
                              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
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
                                        "flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-xs",
                                        isBusy
                                          ? "opacity-60 cursor-not-allowed"
                                          : "hover:bg-slate-50 cursor-pointer",
                                        checked && !isBusy && "bg-slate-50",
                                      )}
                                    >
                                      <span className="font-semibold uppercase text-slate-700">
                                        {formatRoleLabel(role)}
                                      </span>

                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 accent-brand-600"
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

                              <div className="px-3 pb-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                                Selecciona uno o más roles.
                              </div>
                            </div>
                          )}
                        </div>
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
