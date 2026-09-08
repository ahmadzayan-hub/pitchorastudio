"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const FAQS = [
  { q: "What is Tweenz AI?", a: "Tweenz AI is a bilingual AI-powered academic operating system designed specifically for MBA students. It combines AI study intelligence with Moodle-style course management to help you answer: 'What should I focus on today to improve my MBA performance?'" },
  { q: "Who is Tweenz AI for?", a: "Tweenz AI is built for MBA students, particularly those studying online or in bilingual programs in the GCC and MENA region. It supports both English and Arabic interfaces with full RTL layout." },
  { q: "How does the AI Tutor work?", a: "The AI Tutor uses Retrieval-Augmented Generation (RAG) to answer questions based on your uploaded course materials — lecture slides, PDFs, notes — with cited sources, so you always know where the answer came from." },
  { q: "Is my data private?", a: "Yes. Your files and academic data are private to you, protected by row-level security in our database. We never share your data with third parties or use it to train AI models." },
  { q: "What file types can I upload?", a: "You can upload PDF, DOCX, PPTX, and TXT files up to 50MB each. The AI processes them into searchable chunks for the tutor, study packs, flashcards, and quizzes." },
  { q: "Does it work offline?", a: "Core pages (dashboard, study packs, flashcards) are available offline through our Progressive Web App (PWA). AI features require an internet connection." },
  { q: "What languages are supported?", a: "Tweenz AI fully supports English and Arabic. You can switch languages at any time, and the interface adapts to RTL layout when Arabic is selected." },
  { q: "How does billing work?", a: "We offer a free 7-day trial with no credit card required. After the trial, you can subscribe monthly or annually. All subscriptions include Stripe-secured billing with one-click cancellation." },
  { q: "Can I connect my Moodle account?", a: "Yes, the Moodle Connector (available in Release 2) allows you to sync courses, assignments, and grades directly from your university's Moodle LMS." },
  { q: "How do I cancel my subscription?", a: "You can cancel anytime from the Subscription page in your dashboard. Access continues until the end of your billing period." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-500">Everything you need to know about Tweenz AI.</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="card">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-start"
            >
              <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
              {open === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
            </button>
            {open === i && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center card">
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Still have questions?</p>
        <p className="text-sm text-slate-500 mb-4">We&apos;re happy to help. Reach out to our support team.</p>
        <Link href="/contact" className="btn-primary">Contact Support</Link>
      </div>
    </main>
  );
}
