"use client";

import { useState } from "react";
import { Mail, MessageSquare, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSent(true);
    setSending(false);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-7 h-7 text-brand-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Contact Us</h1>
        <p className="text-slate-500">We typically reply within 24 hours.</p>
      </div>

      {sent ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h2>
          <p className="text-slate-500">Thank you for reaching out. We&apos;ll get back to you shortly at {form.email}.</p>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required>
                <option value="">Select a subject</option>
                <option value="billing">Billing & Subscription</option>
                <option value="technical">Technical Issue</option>
                <option value="feature">Feature Request</option>
                <option value="privacy">Privacy & Data</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="How can we help you?"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? "Sending..." : <><Mail className="w-4 h-4" />Send Message</>}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
