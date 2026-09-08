"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { useState } from "react";

const plans = [
  { key: "free",    popular: false },
  { key: "student", popular: true  },
  { key: "pro",     popular: false },
] as const;

export default function PricingPage() {
  const { t } = useI18n();
  const [annual, setAnnual] = useState(false);

  return (
    <div className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {t("pricing.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{t("pricing.subtitle")}</p>

        {/* Monthly / Annual toggle */}
        <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${!annual ? "bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
          >
            {t("pricing.monthly")}
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${annual ? "bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
          >
            {t("pricing.annual")}
            <span className="badge-green text-xs">{t("pricing.save")}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {plans.map(plan => {
          const price = annual
            ? t(`pricing.${plan.key}.price_annual` as DictKey)
            : t(`pricing.${plan.key}.price_monthly` as DictKey);
          const period = annual ? t("pricing.per_year") : t("pricing.per_month");
          const featureList = (t(`pricing.${plan.key}.features` as DictKey) as string).split(",");

          return (
            <div key={plan.key} className={`relative card text-start flex flex-col ${plan.popular ? "border-2 border-brand-500 shadow-card-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                    {t("pricing.popular")}
                  </span>
                </div>
              )}
              <div className="mb-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {t(`pricing.${plan.key}.name` as DictKey)}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">${price}</span>
                  <span className="text-slate-400 text-sm pb-1">{period}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(`pricing.${plan.key}.description` as DictKey)}
                </p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {featureList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <Check size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f.trim()}
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button variant={plan.popular ? "primary" : "secondary"} fullWidth>
                  {t(plan.key === "free" ? "pricing.cta.free" : "pricing.cta.paid")}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-slate-400">{t("pricing.trial_note")}</p>

      {/* FAQ section */}
      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
          Pricing FAQ
        </h2>
        {[
          { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription at any time from your billing portal. No questions asked." },
          { q: "Is there a free trial?", a: "All paid plans include a 7-day free trial. No credit card required to start." },
          { q: "Can I switch plans?", a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately." },
          { q: "Do you offer student discounts?", a: "Contact us at support@tweenz.ae with your student ID for regional pricing options." },
          { q: "Is my data private?", a: "Yes. Your uploaded files, notes, and AI conversations are private and never used for model training without your explicit opt-in." },
          { q: "What payment methods are accepted?", a: "All major credit cards via Stripe. UAE cards, international cards, and some digital wallets are supported." },
        ].map((item, i) => (
          <div key={i} className="border-b border-slate-100 dark:border-slate-800 py-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{item.q}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
