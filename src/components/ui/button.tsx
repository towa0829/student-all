import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600",
  secondary:
    "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100"
};

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClassName[variant],
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
