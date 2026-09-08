"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CheckSquare, Plus, X, GripVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  course_id?: string;
  course_name?: string;
  due_date?: string;
  created_at: string;
}

interface Course { id: string; name: string; }

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "tasks.todo" },
  { key: "in_progress", label: "tasks.inProgress" },
  { key: "done", label: "tasks.done" },
];

const PRIORITY_CLASSES: Record<string, string> = {
  high: "badge-red",
  medium: "badge-yellow",
  low: "badge-gray",
};

export default function TasksPage() {
  const { t, dir } = useI18n();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState<Task["status"] | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", course_id: "", due_date: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [tr, cr] = await Promise.all([fetch("/api/tasks"), fetch("/api/courses")]);
      if (tr.ok) setTasks(await tr.json());
      if (cr.ok) setCourses(await cr.json());
      setLoading(false);
    })();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!showAdd) return;
    setSaving(true);
    const r = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: showAdd }),
    });
    if (r.ok) {
      const task = await r.json();
      setTasks(prev => [task, ...prev]);
      setForm({ title: "", description: "", priority: "medium", course_id: "", due_date: "" });
      setShowAdd(null);
    }
    setSaving(false);
  }

  async function moveTask(id: string, status: Task["status"]) {
    const r = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const byStatus = (status: Task["status"]) => tasks.filter(t => t.status === status);

  return (
    <div className="p-6 space-y-6" dir={dir}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("tasks.title")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("tasks.subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div key={col.key} className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t(col.label as any)}
                  <span className="ms-2 badge-gray">{byStatus(col.key).length}</span>
                </h3>
                <button onClick={() => setShowAdd(col.key)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {showAdd === col.key && (
                <div className="card">
                  <form onSubmit={addTask} className="space-y-3">
                    <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={t("tasks.form.title")} required className="text-sm" />
                    <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={t("tasks.form.description")} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="text-sm">
                        <option value="low">{t("tasks.priority.low")}</option>
                        <option value="medium">{t("tasks.priority.medium")}</option>
                        <option value="high">{t("tasks.priority.high")}</option>
                      </select>
                      <select value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))} className="text-sm">
                        <option value="">{t("tasks.form.noCourse")}</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="text-sm" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowAdd(null)} className="btn-secondary btn-sm flex-1">{t("common.cancel")}</button>
                      <button type="submit" disabled={saving} className="btn-primary btn-sm flex-1">{t("common.add")}</button>
                    </div>
                  </form>
                </div>
              )}

              {byStatus(col.key).map(task => (
                <div key={task.id} className="card group cursor-grab active:cursor-grabbing">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
                      {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={PRIORITY_CLASSES[task.priority]}>{t(`tasks.priority.${task.priority}`)}</span>
                        {task.course_name && <span className="badge-blue text-xs">{task.course_name}</span>}
                        {task.due_date && <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {COLUMNS.filter(c => c.key !== col.key).map(c => (
                      <button key={c.key} onClick={() => moveTask(task.id, c.key)} className="btn-ghost btn-sm text-xs flex-1 py-1">
                        → {t(c.label as any)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
