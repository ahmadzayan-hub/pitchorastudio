"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Smartphone, Check, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/presentiq/i18n/context";

/** BeforeInstallPromptEvent — not in lib.dom yet in TS 5.6, so we
 *  declare the shape we actually use. Chrome fires this event on
 *  Android + desktop when the site is PWA-installable. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

/**
 * Landing "Get the app" section.
 *
 * The user's platform decides what shows up:
 *
 *   Android / desktop Chrome / Edge  → real PWA install button that
 *   fires the browser's Add-to-home-screen flow.
 *
 *   iOS Safari                       → step-by-step "Share → Add to
 *   Home Screen" hint (Safari does not expose beforeinstallprompt).
 *
 *   Already-installed / unsupported  → dismiss the banner and show
 *   the platform-agnostic mobile QR fallback.
 */
export function InstallApp() {
  const { lang } = useI18n();
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window));

    // Detect standalone (already-installed) mode across browsers.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // Register the service worker so the install prompt is eligible
    // to fire on real users (dev + prod). Fire-and-forget.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }, [deferred]);

  const canInstall = !!deferred && !installed;
  const showIosHint = isIOS && !installed;

  return (
    <section
      className="pq-install"
      id="get-the-app"
      aria-labelledby="pq-install-title"
    >
      <div className="pq-install-inner">
        <div className="pq-install-copy">
          <div className="pq-section-eyebrow">
            {lang === "ar" ? "الجوّال" : "Mobile"}
          </div>
          <h2 id="pq-install-title" className="pq-section-title" style={{ textAlign: "start" }}>
            {lang === "ar"
              ? "بِتشورا في جيبك، بلا متجر تطبيقات"
              : "Pitchora in your pocket, without the app store"}
          </h2>
          <p className="pq-section-sub" style={{ textAlign: "start", marginBottom: "1.25rem" }}>
            {lang === "ar"
              ? "ثبِّت بِتشورا مباشرةً من متصفّح جوّالك. يعمل مثل تطبيق أندرويد أصلي: أيقونة على الشاشة الرئيسية، تشغيل بلا شريط عناوين، ووصول للعمل حتى دون إنترنت."
              : "Install Pitchora straight from your phone browser. It behaves like a native Android app: home-screen icon, full-screen launch, and access to your recent work even offline."}
          </p>

          <ul className="pq-install-feats" aria-label={lang === "ar" ? "ميّزات النسخة الجوّالة" : "Mobile features"}>
            {[
              lang === "ar" ? "تصميم يبدأ من الجوّال أولاً" : "Mobile-first, touch-tuned interface",
              lang === "ar" ? "استخدام دون اتّصال بالإنترنت" : "Works offline for recent decks",
              lang === "ar" ? "إشعارات على جهازك عند اكتمال التوليد" : "Push notification when generation finishes",
              lang === "ar" ? "بلا متجر تطبيقات وبلا انتظار للموافقة" : "No app store, no waiting for review",
            ].map((line, i) => (
              <li key={i}>
                <Check size={14} strokeWidth={2.4} aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="pq-install-actions">
            {canInstall ? (
              <button type="button" onClick={install} className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
                <Download size={16} strokeWidth={2.2} aria-hidden />
                <span>{lang === "ar" ? "تثبيت التطبيق" : "Install the app"}</span>
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden />
              </button>
            ) : installed ? (
              <div className="pq-install-status">
                <Check size={16} strokeWidth={2.4} aria-hidden />
                <span>{lang === "ar" ? "التطبيق مثبّت على جهازك" : "App is installed on this device"}</span>
              </div>
            ) : showIosHint ? (
              <div className="pq-install-ios-hint">
                <Smartphone size={16} strokeWidth={2.2} aria-hidden />
                <span>
                  {lang === "ar"
                    ? "على iPhone: اضغط زر المشاركة، ثم «إضافة إلى الشاشة الرئيسية»."
                    : "On iPhone: tap the Share button, then “Add to Home Screen”."}
                </span>
              </div>
            ) : (
              <a
                href="/presentiq"
                className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill"
                aria-label={lang === "ar" ? "افتح من هاتفك" : "Open on your phone"}
              >
                <Smartphone size={16} strokeWidth={2.2} aria-hidden />
                <span>{lang === "ar" ? "افتح من هاتفك" : "Open on your phone"}</span>
              </a>
            )}
            <a
              href="#"
              className="pq-btn pq-btn-liquid pq-btn-liquid-pill"
              aria-label={lang === "ar" ? "قريباً على متجر Google Play" : "Coming soon to Google Play"}
              onClick={(e) => e.preventDefault()}
            >
              <span>{lang === "ar" ? "قريباً · Google Play" : "Coming soon · Google Play"}</span>
            </a>
          </div>
        </div>

        <div className="pq-install-visual" aria-hidden>
          <div className="pq-install-phone">
            <div className="pq-install-phone-notch" />
            <div className="pq-install-phone-screen">
              <div className="pq-install-phone-header">
                <span className="pq-install-phone-dot" />
                <span className="pq-install-phone-dot" />
                <span className="pq-install-phone-dot" />
              </div>
              <div className="pq-install-phone-pill">
                {lang === "ar" ? "استوديو الفكرة" : "The idea studio"}
              </div>
              <div className="pq-install-phone-title">
                {lang === "ar" ? "من أين نبدأ؟" : "Where should we begin?"}
              </div>
              <div className="pq-install-phone-input">
                <span>{lang === "ar" ? "١٠ شرائح عن..." : "10 slides on..."}</span>
              </div>
              <div className="pq-install-phone-cta">
                {lang === "ar" ? "ابدأ العرض" : "Start deck"}
              </div>
              <div className="pq-install-phone-grid">
                <span /><span /><span /><span />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
