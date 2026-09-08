"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Bell, Plus, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Info, CheckCircle, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  course_id: string | null;
  course_name?: string;
  title: string;
  body: string;
  source: string;
  ai_summary?: string;
  ai_required_action?: string;
  ai_risk_level?: "low" | "medium" | "high";
  ai_type?: string;
  is_archived: boolean;
  posted_at: string;
  created_at: string;
}

interface Course { id: string; name: string; }

export default function AnnouncementsPage() {
  const { t, dir } = useI18n();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", course_id: "", source: "manual" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [ar, cr] = await Promise.all([fetch("/api/announcements"), fetch("/api/courses")]);
      if (ar.ok) setAnnouncements(await ar.json());
      if (cr.ok) setCourses(await cr.json());
      setLoading(false);
    })();
  }, []);

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      const newAnn = await r.json();
      setAnnouncements(prev => [newAnn, ...prev]);
      setForm({ title: "", body: "", course_id: "", source: "manual" });
      setShowAdd(false);
    }
    setSaving(false);
  }

  function riskIcon(level?: string) {
    if (level === "high") return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (level === "medium") return <Info className="w-4 h-4 text-amber-500" />;
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  }

  function riskBadge(level?: string) {
    if (level === "high") return "badge-red";
    if (level === "medium") return "badge-yellow";
    return "badge-green";
  }

  return (
    <div className="p-6 space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("announcements.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("announcements.subtitle")}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t("announcements.addBtn")}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t("announcements.pasteTitle")}</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("announcements.form.title")}</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("announcements.form.body")}</label>
              <textarea
                rows={5}
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                placeholder={t("announcements.form.bodyPlaceholder")}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("announcements.form.course")}</label>
                <select value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))}>
                  <option value="">{t("announcements.form.noCourse")}</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("announcements.form.source")}</label>
                <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                  <option value="manual">{t("announcements.form.sourceManual")}</option>
                  <option value="moodle">{t("announcements.form.sourceMoodle")}</option>
                  <option value="email">{t("announcements.form.sourceEmail")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">{t("common.cancel")}</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("common.saving")}</> : <><Sparkles className="w-4 h-4" />{t("announcements.addAndAnalyze")}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">{t("announcements.noAnnouncements")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className="card">
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => toggle(ann.id)}
              >
                <div className="p-2 bg-brand-50 dark:bg-brand-950/30 rounded-lg mt-0.5">
                  <Bell className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{ann.title}</h3>
                    {ann.ai_risk_level && (
                      <span className={riskBadge(ann.ai_risk_level)}>
                        {riskIcon(ann.ai_risk_level)}
                        {t(`announcements.risk.${ann.ai_risk_level}`)}
                      </span>
                    )}
                    {ann.ai_type && <span className="badge-blue">{ann.ai_type}</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {ann.course_name || t("announcements.general")} · {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
                  </p>
                  {ann.ai_summary && !expanded.has(ann.id) && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{ann.ai_summary}</p>
                  )}
                </div>
                <button className="text-slate-400">
                  {expanded.has(ann.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {expanded.has(ann.id) && (
                <div className="mt-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ann.body}</p>
                  {ann.ai_summary && (
                    <div className="bg-brand-50 dark:bg-brand-950/20 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400">
                        <Sparkles className="w-4 h-4" />
                        {t("announcements.aiAnalysis")}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300"><strong>{t("announcements.summary")}: </strong>{ann.ai_summary}</p>
                      {ann.ai_required_action && (
                        <p className="text-sm text-slate-700 dark:text-slate-300"><strong>{t("announcements.requiredAction")}: </strong>{ann.ai_required_action}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
