import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type PanelProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.3)] backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
