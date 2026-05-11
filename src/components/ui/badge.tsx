import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        {
          "bg-blue-500/10 text-blue-500 border-blue-500/20": variant === "default",
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20": variant === "success",
          "bg-amber-500/10 text-amber-500 border-amber-500/20": variant === "warning",
          "bg-rose-500/10 text-rose-500 border-rose-500/20": variant === "destructive",
          "border-slate-800 text-slate-400": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {props.children}
    </div>
  );
}

export { Badge };
