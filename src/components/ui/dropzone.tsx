import * as React from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. INTERFAZ
// Omitimos 'onDrop' del div nativo porque nosotros lo estamos sobreescribiendo
export interface DropzoneProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrop"
> {
  onDrop?: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  small?: boolean;
  accept?: string;
}

// 2. COMPONENTE BASE
const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      onDrop,
      label = "Arrastra tus archivos aquí",
      sublabel = "Arrastra tus archivos aquí",
      className,
      small = false,
      accept,
      ...props
    },
    ref,
  ) => {
    const [isDragActive, setIsDragActive] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onDrop?.(Array.from(e.dataTransfer.files));
      }
    };

    const handleClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onDrop?.(Array.from(e.target.files));
      }
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group",
          isDragActive
            ? "border-brand-500 bg-brand-50/50"
            : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 hover:border-brand-400",
          small ? "p-4" : "p-10",
          className,
        )}
        {...props}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileInput}
        />
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform group-hover:scale-110 duration-200",
            small ? "h-10 w-10 mb-2" : "h-16 w-16 mb-4",
          )}
        >
          {small ? (
            <FileText className="h-5 w-5 text-brand-600" />
          ) : (
            <UploadCloud className="h-8 w-8 text-brand-600" />
          )}
        </div>
        <div className="text-center space-y-1">
          <p
            className={cn(
              "font-medium text-slate-900",
              small ? "text-xs" : "text-base",
            )}
          >
            {label}
          </p>
          {!small && <p className="text-sm text-slate-500">{sublabel}</p>}
        </div>
      </div>
    );
  },
);
Dropzone.displayName = "Dropzone";

// 3. EXPORTACIÓN
export { Dropzone };
