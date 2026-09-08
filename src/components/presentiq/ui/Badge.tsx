import { ReactNode } from "react";

const tones: Record<string, string> = {
  zinc: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-800",
  blue: "bg-blue-100 text-blue-800",
  navy: "bg-indigo-100 text-indigo-800",
};

export function Badge({ children, tone = "zinc" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
