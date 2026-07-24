import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {eyebrow && <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-4 lg:p-6 max-w-[1600px] mx-auto w-full", className)}>{children}</div>;
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && <div className="mb-4 text-muted-foreground/60">{icon}</div>}
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</div>}
    </div>
  );
}

export function StatusDot({ tone }: { tone: "success" | "warning" | "danger" | "info" | "muted" }) {
  const map = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    info: "bg-primary",
    muted: "bg-muted-foreground",
  };
  return <span className={cn("inline-block size-1.5 rounded-full", map[tone])} />;
}
