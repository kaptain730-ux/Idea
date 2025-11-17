import * as React from "react";

export type BadgeProps = {
  tone?: "default" | "success" | "warning" | "danger";
  children: React.ReactNode;
};

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-900",
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-rose-100 text-rose-900"
};

export function Badge({ tone = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}
