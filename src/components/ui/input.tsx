import * as React from "react";
import { cn } from "@/lib/utils";

// 1. INTERFAZ
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

// 2. COMPONENTE BASE
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {/* Renderizado condicional del icono */}
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Input principal */}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 transition-all duration-200",
            "placeholder:text-slate-400",
            "focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/10",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
            icon && "pl-10", // Da espacio si hay un icono
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

// 3. EXPORTACIÓN
export { Input };
