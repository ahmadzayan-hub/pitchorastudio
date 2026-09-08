import Link from "next/link";
import { Upload, Brain, BarChart3, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Set Up Your Courses",
    description: "Add your MBA courses manually or connect your Moodle LMS. Upload lecture slides, PDFs, and notes. The AI indexes every document for intelligent retrieval.",
    color: "text-brand-600 bg-brand-100 dark:bg-brand-900/50",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Processes Your Materials",
    description: "Tweenz AI extracts and chunks your documents, generates embeddings, and builds a personalized knowledge base — all private to you.",
    color: "text-teal-600 bg-teal-100 dark:bg-teal-900/50",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Track Everything",
    description: "Log grades, upcoming deadlines, and announcements. The system calculates your GPA, identifies at-risk items, and keeps your timeline organized.",
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    step: "04",
    icon: Sparkles,
    title: "Study Smarter with AI",
    description: "Get AI-generated study packs, flashcards, and quizzes. Chat with your personal AI Tutor for cited answers. Ask My MBA agent for strategic guidance.",
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/50",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-gradient-to-br from-brand-950 to-teal-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">How Tweenz AI Works</h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          From document upload to AI-powered insights — here&apos;s your path to MBA excellence.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {STEPS.map(({ step, icon: Icon, title, description, color }, i) => (
          <div key={step} className={`flex gap-8 items-start ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
            <div className="flex-shrink-0 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 ${color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-3xl font-black text-slate-200 dark:text-slate-800">{step}</span>
            </div>
            <div className="flex-1 pt-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
              <p className="text-slate-500 leading-relaxed text-lg">{description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-brand-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Start in 2 minutes</h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">No Moodle connection required. Add your first course manually and let the AI start working for you.</p>
        <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-white/90 px-8 py-3.5 text-base font-semibold">
          Try Free for 7 Days →
        </Link>
      </section>
    </main>
  );
}
