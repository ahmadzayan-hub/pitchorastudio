import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeColor = "blue" | "green" | "yellow" | "red" | "purple" | "gray" | "teal";

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  blue:   "badge-blue",
  green:  "badge-green",
  yellow: "badge-yellow",
  red:    "badge-red",
  purple: "badge-purple",
  gray:   "badge-gray",
  teal:   "badge bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
};

export function Badge({ color = "gray", children, className }: BadgeProps) {
  return (
    <span className={clsx(colorMap[color], className)}>
      {children}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: "safe" | "due_soon" | "at_risk" | "overdue" }) {
  const config = {
    safe:     { label: "Safe",      color: "green"  },
    due_soon: { label: "Due soon",  color: "yellow" },
    at_risk:  { label: "At risk",   color: "red"    },
    overdue:  { label: "Overdue",   color: "red"    },
  }[risk];
  return <Badge color={config.color as BadgeColor}>{config.label}</Badge>;
}
