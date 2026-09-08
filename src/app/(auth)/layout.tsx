import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-teal-900 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2.5 text-white font-bold text-lg">
          <GraduationCap size={24} />
          Tweenz AI
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Tweenz AI. Operated from UAE.
        {" · "}
        <Link href="/privacy" className="hover:text-white/70 transition">Privacy</Link>
        {" · "}
        <Link href="/terms" className="hover:text-white/70 transition">Terms</Link>
      </div>
    </div>
  );
}
