"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Menu, X, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  const { t, locale, setLocale, dir } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/features",      label: t("nav.features") },
    { href: "/pricing",       label: t("nav.pricing") },
    { href: "/how-it-works",  label: t("nav.how_it_works") },
    { href: "/for-students",  label: t("nav.for_students") },
    { href: "/faq",           label: t("nav.faq") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-950/90 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-brand-700 dark:text-brand-400">
            <GraduationCap size={26} />
            <span className="text-lg tracking-tight">Tweenz AI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 rounded-lg hover:bg-brand-50 transition dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-brand-950/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="hidden sm:flex items-center px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle language"
            >
              {t("lang.toggle")}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 rounded-lg hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("nav.login")}
            </Link>

            <Link href="/signup">
              <Button size="sm">{t("nav.signup")}</Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-2 px-3">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" fullWidth size="sm">{t("nav.login")}</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button fullWidth size="sm">{t("nav.signup")}</Button>
                </Link>
              </div>
              <button
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                className="mt-1 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 text-start"
              >
                {t("lang.toggle")}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
