import { BookOpen, Brain, BarChart3, Bell, Calendar, MessageSquare, Sparkles, Shield, Globe, Zap, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: Brain, color: "text-brand-600 bg-brand-100", titleKey: "features.aiTutor.title", descKey: "features.aiTutor.desc" },
  { icon: BookOpen, color: "text-teal-600 bg-teal-100", titleKey: "features.studyPacks.title", descKey: "features.studyPacks.desc" },
  { icon: BarChart3, color: "text-emerald-600 bg-emerald-100", titleKey: "features.grades.title", descKey: "features.grades.desc" },
  { icon: Bell, color: "text-amber-600 bg-amber-100", titleKey: "features.announcements.title", descKey: "features.announcements.desc" },
  { icon: Calendar, color: "text-purple-600 bg-purple-100", titleKey: "features.timeline.title", descKey: "features.timeline.desc" },
  { icon: Sparkles, color: "text-rose-600 bg-rose-100", titleKey: "features.weeklyBrief.title", descKey: "features.weeklyBrief.desc" },
  { icon: FileText, color: "text-indigo-600 bg-indigo-100", titleKey: "features.files.title", descKey: "features.files.desc" },
  { icon: MessageSquare, color: "text-cyan-600 bg-cyan-100", titleKey: "features.askMba.title", descKey: "features.askMba.desc" },
  { icon: Globe, color: "text-green-600 bg-green-100", titleKey: "features.bilingual.title", descKey: "features.bilingual.desc" },
  { icon: Shield, color: "text-slate-600 bg-slate-100", titleKey: "features.privacy.title", descKey: "features.privacy.desc" },
  { icon: Zap, color: "text-yellow-600 bg-yellow-100", titleKey: "features.offline.title", descKey: "features.offline.desc" },
  { icon: GraduationCap, color: "text-pink-600 bg-pink-100", titleKey: "features.flashcards.title", descKey: "features.flashcards.desc" },
];

export default function FeaturesPage() {
  return (
    <main className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 to-teal-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Everything Your MBA Needs</h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Tweenz AI combines the power of large language models with Moodle-style academic management — built exclusively for MBA students.
        </p>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, titleKey, descKey }) => (
            <div key={titleKey} className="card-hover">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {titleKey.split(".").pop()?.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {descKey.split(".").pop()?.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to Elevate Your MBA?</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">Start your free 7-day trial. No credit card required.</p>
        <Link href="/signup" className="btn-primary btn-lg">Start Free Trial</Link>
      </section>
    </main>
  );
}
