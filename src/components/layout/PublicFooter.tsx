"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { GraduationCap } from "lucide-react";

export function PublicFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold mb-3">
              <GraduationCap size={22} />
              <span>Tweenz AI</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("app.tagline")}
            </p>
            <p className="text-xs text-slate-500 mt-3">{t("legal.country")}</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/features",     label: t("nav.features") },
                { href: "/pricing",      label: t("nav.pricing") },
                { href: "/how-it-works", label: t("nav.how_it_works") },
                { href: "/for-students", label: t("nav.for_students") },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/faq",     label: t("nav.faq") },
                { href: "/contact", label: t("nav.contact") },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/privacy", label: t("legal.privacy") },
                { href: "/terms",   label: t("legal.terms") },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>{t("legal.copyright", { year: String(year) })}</p>
          <p>{t("legal.country")}</p>
        </div>
      </div>
    </footer>
  );
}
