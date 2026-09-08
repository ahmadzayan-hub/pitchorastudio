import clsx from "clsx";

interface ProgressProps {
  value: number;
  className?: string;
  color?: "blue" | "green" | "yellow" | "red";
  showLabel?: boolean;
  size?: "sm" | "md";
}

const gradientMap = {
  blue:   "linear-gradient(90deg, #3b82f6, #6366f1)",
  green:  "linear-gradient(90deg, #10b981, #14b8a6)",
  yellow: "linear-gradient(90deg, #f59e0b, #f97316)",
  red:    "linear-gradient(90deg, #ef4444, #dc2626)",
};

export function Progress({ value, className, color = "blue", showLabel, size = "md" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div className={clsx("flex-1 progress-bar", size === "sm" && "h-1.5")}>
        <div
          className="progress-fill"
          style={{ width: `${clamped}%`, background: gradientMap[color] }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 min-w-[36px] text-end">{clamped}%</span>
      )}
    </div>
  );
}
