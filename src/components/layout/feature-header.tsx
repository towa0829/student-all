import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeaderLink = {
  href: string;
  label: string;
};

type FeatureHeaderProps = {
  badgeClassName: string;
  badgeLabel: string;
  description: string;
  Icon: LucideIcon;
  links: HeaderLink[];
  signOutAction: () => Promise<void>;
  title: string;
};

export function FeatureHeader({
  badgeClassName,
  badgeLabel,
  description,
  Icon,
  links,
  signOutAction,
  title
}: FeatureHeaderProps) {
  return (
    <header className="flex flex-col gap-5 rounded-4xl border border-white/70 bg-white/80 px-8 py-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur md:flex-row md:items-start md:justify-between">
      <div className="space-y-4">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${badgeClassName}`}
        >
          <Icon className="size-4" />
          {badgeLabel}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">{title}</h1>
          <p className="text-sm leading-7 text-slate-600 md:text-base">{description}</p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <form action={signOutAction}>
        <Button className="w-full md:w-auto" type="submit" variant="secondary">
          ログアウト
        </Button>
      </form>
    </header>
  );
}
