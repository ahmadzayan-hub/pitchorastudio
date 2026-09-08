import { ReactNode } from "react";

/**
 * v0.3 — dark-first card. Surface and border use the PresentIQ palette
 * variables so the editor / quality / dashboard inner cards read as
 * elevated surfaces inside the dark forest theme.
 */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl shadow-sm ${className}`}
      style={{
        background: "var(--pq-surface-card)",
        border: "1px solid var(--pq-border-soft)",
        color: "var(--pq-text-main)",
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 p-5"
      style={{ borderBottom: "1px solid var(--pq-border-soft)" }}
    >
      <div>
        <h3 className="text-base font-semibold" style={{ color: "var(--pq-text-main)" }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: "var(--pq-text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
