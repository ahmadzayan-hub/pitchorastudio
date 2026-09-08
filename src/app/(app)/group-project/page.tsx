"use client";

import { useState } from "react";
import {
  Users, CheckSquare, FileText, Plus, X, Check,
  Clock, AlertTriangle, ChevronDown, ChevronUp, Paperclip, Calendar,
  Crown, RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Member {
  id: string; name: string; role: "lead" | "member"; email: string;
  avatar: string; tasks: number; completed: number;
}
interface ProjectTask {
  id: string; title: string; assignee_id: string; due_date: string;
  status: "todo" | "in_progress" | "done"; priority: "high" | "medium" | "low";
}
interface MeetingNote {
  id: string; date: string; title: string; notes: string; action_items: string[];
}
interface SharedFile {
  id: string; name: string; uploaded_by: string; size: string; uploaded_at: string;
}

const DEMO_PROJECT = {
  name: "UAE Market Entry Strategy",
  course_name: "Strategic Management",
  course_code: "MGMT 601",
  due_date: "2026-05-25T00:00:00.000Z",
  description: "Develop a comprehensive market entry strategy for a fictional European tech company entering the UAE B2B SaaS market. Deliverable: 20-page strategy report + 15-min presentation.",
};

const DEMO_MEMBERS: Member[] = [
  { id: "demo-user-00000000-0000-0000-0000-000000000000", name: "Sara Al-Mansouri", role: "lead", email: "sara@tweenz.ae", avatar: "SA", tasks: 4, completed: 2 },
  { id: "u-002", name: "Khalid Al-Rashidi", role: "member", email: "khalid@tweenz.ae", avatar: "KA", tasks: 3, completed: 1 },
  { id: "u-003", name: "Layla Hassan", role: "member", email: "layla@tweenz.ae", avatar: "LH", tasks: 3, completed: 2 },
  { id: "u-006", name: "Mohammed Al-Farsi", role: "member", email: "m.alfarsi@tweenz.ae", avatar: "MA", tasks: 2, completed: 1 },
];

const INIT_TASKS: ProjectTask[] = [
  { id: "pt-001", title: "UAE SaaS market research & competitive analysis", assignee_id: "u-002", due_date: "2026-05-10T00:00:00.000Z", status: "done", priority: "high" },
  { id: "pt-002", title: "Porter's Five Forces for UAE B2B SaaS", assignee_id: "demo-user-00000000-0000-0000-0000-000000000000", due_date: "2026-05-08T00:00:00.000Z", status: "in_progress", priority: "high" },
  { id: "pt-003", title: "Regulatory & legal requirements analysis (TDRA, free zones)", assignee_id: "u-003", due_date: "2026-05-12T00:00:00.000Z", status: "done", priority: "medium" },
  { id: "pt-004", title: "Financial projections & break-even analysis", assignee_id: "u-003", due_date: "2026-05-14T00:00:00.000Z", status: "in_progress", priority: "high" },
  { id: "pt-005", title: "Go-to-market strategy & distribution channels", assignee_id: "demo-user-00000000-0000-0000-0000-000000000000", due_date: "2026-05-15T00:00:00.000Z", status: "todo", priority: "medium" },
  { id: "pt-006", title: "Risk register & mitigation strategies", assignee_id: "u-006", due_date: "2026-05-17T00:00:00.000Z", status: "todo", priority: "medium" },
  { id: "pt-007", title: "Executive summary & recommendations", assignee_id: "demo-user-00000000-0000-0000-0000-000000000000", due_date: "2026-05-20T00:00:00.000Z", status: "todo", priority: "high" },
  { id: "pt-008", title: "Presentation design (15 slides)", assignee_id: "u-006", due_date: "2026-05-22T00:00:00.000Z", status: "todo", priority: "low" },
  { id: "pt-009", title: "Rehearsal & feedback session", assignee_id: "u-002", due_date: "2026-05-24T00:00:00.000Z", status: "todo", priority: "low" },
];

const INIT_MEETINGS: MeetingNote[] = [
  {
    id: "mn-001", date: "2026-04-28T14:00:00.000Z", title: "Kick-off Meeting",
    notes: "Team agreed on project scope: UAE B2B SaaS market entry for a fictional European HR tech company. Sara volunteered as project lead. Divided sections by MBA specialization. Weekly check-ins every Monday 2 PM.",
    action_items: ["Sara: Set up shared Google Drive", "Khalid: Competitive landscape by May 3", "All: Read UAE Digital Economy Strategy 2031"],
  },
  {
    id: "mn-002", date: "2026-05-05T14:00:00.000Z", title: "Week 2 Progress Check",
    notes: "Khalid presented competitive analysis — 6 incumbent players identified. Layla confirmed free zone incorporation recommended (DIFC/DMCC). Break-even at 18 months with conservative assumptions.",
    action_items: ["Layla: Add TDRA compliance to Section 3", "Sara: Draft Porter's Five Forces by May 8", "Mohammed: Start risk register"],
  },
];

const DEMO_FILES: SharedFile[] = [
  { id: "sf-001", name: "UAE_SaaS_Competitive_Analysis_v2.xlsx", uploaded_by: "Khalid Al-Rashidi", size: "1.2 MB", uploaded_at: "2026-05-03T10:00:00.000Z" },
  { id: "sf-002", name: "Free_Zone_Comparison_Matrix.pdf", uploaded_by: "Layla Hassan", size: "445 KB", uploaded_at: "2026-05-06T09:00:00.000Z" },
  { id: "sf-003", name: "Financial_Model_v1.xlsx", uploaded_by: "Layla Hassan", size: "892 KB", uploaded_at: "2026-05-05T16:00:00.000Z" },
  { id: "sf-004", name: "Market_Entry_Report_DRAFT.docx", uploaded_by: "Sara Al-Mansouri", size: "234 KB", uploaded_at: "2026-05-06T11:30:00.000Z" },
];

const STATUS_CLASSES: Record<string, string> = {
  done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  todo: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};
const PRIORITY_DOT: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-400", low: "bg-slate-300" };

type Tab = "overview" | "tasks" | "meetings" | "files";

export default function GroupProjectPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [tasks, setTasks] = useState<ProjectTask[]>(INIT_TASKS);
  const [meetings, setMeetings] = useState<MeetingNote[]>(INIT_MEETINGS);
  const [files] = useState<SharedFile[]>(DEMO_FILES);
  const members = DEMO_MEMBERS;
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee_id: members[0].id, due_date: "", priority: "medium" as "high"|"medium"|"low" });
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>("mn-002");
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: "", notes: "", action_items: "" });

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const progress = Math.round((doneTasks / totalTasks) * 100);
  const daysLeft = Math.ceil((new Date(DEMO_PROJECT.due_date).getTime() - Date.now()) / 86400000);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    setTasks(prev => [...prev, { id: `pt-${Date.now()}`, ...newTask, status: "todo", due_date: newTask.due_date || new Date(Date.now() + 7 * 86400000).toISOString() }]);
    setNewTask({ title: "", assignee_id: members[0].id, due_date: "", priority: "medium" });
    setShowAddTask(false);
  }

  function cycleStatus(id: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: Record<string, ProjectTask["status"]> = { todo: "in_progress", in_progress: "done", done: "todo" };
      return { ...t, status: next[t.status] };
    }));
  }

  function addMeeting(e: React.FormEvent) {
    e.preventDefault();
    setMeetings(prev => [{ id: `mn-${Date.now()}`, date: new Date().toISOString(), title: newMeeting.title, notes: newMeeting.notes, action_items: newMeeting.action_items.split("\n").filter(Boolean) }, ...prev]);
    setNewMeeting({ title: "", notes: "", action_items: "" });
    setShowAddMeeting(false);
  }

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "tasks", label: "Tasks", count: tasks.filter(t => t.status !== "done").length },
    { key: "meetings", label: "Meeting Notes", count: meetings.length },
    { key: "files", label: "Shared Files", count: files.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project header */}
      <div className="card bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-white/20 rounded-full px-2.5 py-0.5 font-medium">{DEMO_PROJECT.course_code}</span>
              <span className="text-xs text-white/70">{DEMO_PROJECT.course_name}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{DEMO_PROJECT.name}</h1>
            <p className="text-white/80 text-sm max-w-2xl">{DEMO_PROJECT.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-white/70 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due {format(new Date(DEMO_PROJECT.due_date), "MMM d, yyyy")}</span>
            <span className={`text-lg font-bold ${daysLeft <= 7 ? "text-red-200" : "text-white"}`}>{daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}</span>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-white/80">Overall Progress</span>
            <span className="font-bold">{progress}% ({doneTasks}/{totalTasks} tasks)</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-brand-500" /> Team Members</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map(m => {
            const completionRate = m.tasks > 0 ? Math.round((m.completed / m.tasks) * 100) : 0;
            return (
              <div key={m.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:border-brand-300 transition-colors">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{m.avatar}</div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate flex items-center gap-1">{m.name.split(" ")[0]}{m.role === "lead" && <Crown className="w-3 h-3 text-amber-500" />}</p>
                    <p className="text-xs text-slate-400">{m.role === "lead" ? "Project Lead" : "Member"}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-1.5">{m.completed}/{m.tasks} tasks done</div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${tab === t.key ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${tab === t.key ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Responsibility Matrix</h2>
            <button onClick={() => setShowAddTask(true)} className="btn btn-primary flex items-center gap-1.5 text-sm"><Plus className="w-4 h-4" /> Add Task</button>
          </div>
          {showAddTask && (
            <form onSubmit={addTask} className="card border-brand-200 space-y-3">
              <input className="input w-full" placeholder="Task title" value={newTask.title} onChange={e => setNewTask(f => ({ ...f, title: e.target.value }))} required />
              <div className="grid grid-cols-3 gap-3">
                <select className="input" value={newTask.assignee_id} onChange={e => setNewTask(f => ({ ...f, assignee_id: e.target.value }))}>{members.map(m => <option key={m.id} value={m.id}>{m.name.split(" ")[0]}</option>)}</select>
                <select className="input" value={newTask.priority} onChange={e => setNewTask(f => ({ ...f, priority: e.target.value as any }))}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
                <input type="date" className="input" value={newTask.due_date?.slice(0, 10)} onChange={e => setNewTask(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div className="flex gap-2"><button type="submit" className="btn btn-primary text-sm">Add</button><button type="button" onClick={() => setShowAddTask(false)} className="btn btn-ghost text-sm">Cancel</button></div>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2.5 px-3 w-8"></th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Task</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Owner</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr></thead>
              <tbody>
                {tasks.map(task => {
                  const owner = members.find(m => m.id === task.assignee_id);
                  const overdue = new Date(task.due_date) < new Date() && task.status !== "done";
                  return (
                    <tr key={task.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3"><button onClick={() => cycleStatus(task.id)} className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-brand-500 transition-colors">{task.status === "done" && <Check className="w-3 h-3 text-green-600" />}{task.status === "in_progress" && <div className="w-2 h-2 rounded-full bg-blue-500" />}</button></td>
                      <td className="py-3 px-3"><span className={task.status === "done" ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}>{task.title}</span></td>
                      <td className="py-3 px-3">{owner && <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">{owner.avatar}</div><span className="text-xs text-slate-500">{owner.name.split(" ")[0]}</span></div>}</td>
                      <td className="py-3 px-3"><div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority]}`} /><span className="text-xs text-slate-500 capitalize">{task.priority}</span></div></td>
                      <td className={`py-3 px-3 text-xs ${overdue ? "text-red-600 font-semibold" : "text-slate-500"}`}>{overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}{format(new Date(task.due_date), "MMM d")}</td>
                      <td className="py-3 px-3"><span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${STATUS_CLASSES[task.status]}`}>{task.status.replace("_", " ")}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "meetings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Meeting Notes</h2>
            <button onClick={() => setShowAddMeeting(true)} className="btn btn-primary flex items-center gap-1.5 text-sm"><Plus className="w-4 h-4" /> Add Notes</button>
          </div>
          {showAddMeeting && (
            <form onSubmit={addMeeting} className="card border-brand-200 space-y-3">
              <input className="input w-full" placeholder="Meeting title" value={newMeeting.title} onChange={e => setNewMeeting(f => ({ ...f, title: e.target.value }))} required />
              <textarea className="input w-full h-24 resize-none" placeholder="Meeting notes…" value={newMeeting.notes} onChange={e => setNewMeeting(f => ({ ...f, notes: e.target.value }))} />
              <textarea className="input w-full h-20 resize-none" placeholder="Action items (one per line)" value={newMeeting.action_items} onChange={e => setNewMeeting(f => ({ ...f, action_items: e.target.value }))} />
              <div className="flex gap-2"><button type="submit" className="btn btn-primary text-sm">Save</button><button type="button" onClick={() => setShowAddMeeting(false)} className="btn btn-ghost text-sm">Cancel</button></div>
            </form>
          )}
          <div className="space-y-3">
            {meetings.map(m => (
              <div key={m.id} className="card">
                <button className="flex items-center justify-between w-full" onClick={() => setExpandedMeeting(expandedMeeting === m.id ? null : m.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0"><Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                    <div className="text-left"><p className="font-semibold text-slate-900 dark:text-white text-sm">{m.title}</p><p className="text-xs text-slate-400">{format(new Date(m.date), "PPP")}</p></div>
                  </div>
                  {expandedMeeting === m.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedMeeting === m.id && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{m.notes}</p>
                    {m.action_items.length > 0 && (
                      <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Action Items</p>
                        <ul className="space-y-1.5">{m.action_items.map((item, i) => (<li key={i} className="flex items-start gap-2 text-sm"><CheckSquare className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" /><span className="text-slate-700 dark:text-slate-300">{item}</span></li>))}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "files" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Shared Files</h2>
            <button className="btn btn-primary flex items-center gap-1.5 text-sm"><Plus className="w-4 h-4" /> Upload File</button>
          </div>
          <div className="space-y-2">
            {files.map(f => (
              <div key={f.id} className="card-hover flex items-center gap-4 p-3.5">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0"><Paperclip className="w-5 h-5 text-slate-500" /></div>
                <div className="flex-1 min-w-0"><p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{f.name}</p><p className="text-xs text-slate-400">{f.uploaded_by} · {f.size} · {formatDistanceToNow(new Date(f.uploaded_at), { addSuffix: true })}</p></div>
                <button className="btn btn-ghost text-xs border border-slate-200 dark:border-slate-700">Download</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Task Breakdown by Priority</h3>
              <div className="space-y-3">
                {(["high", "medium", "low"] as const).map(p => {
                  const pTasks = tasks.filter(t => t.priority === p);
                  const done = pTasks.filter(t => t.status === "done").length;
                  const labels: Record<string, string> = { high: "High Priority", medium: "Medium Priority", low: "Low Priority" };
                  const colors: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-400", low: "bg-slate-300" };
                  return (
                    <div key={p}>
                      <div className="flex items-center justify-between text-sm mb-1"><div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${colors[p]}`} /><span className="text-slate-600 dark:text-slate-400">{labels[p]}</span></div><span className="text-xs text-slate-500">{done}/{pTasks.length}</span></div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full"><div className={`h-full rounded-full ${colors[p]}`} style={{ width: `${pTasks.length ? (done / pTasks.length) * 100 : 0}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Upcoming Deadlines</h3>
              <div className="space-y-2.5">
                {tasks.filter(t => t.status !== "done").slice(0, 5).map(task => {
                  const owner = members.find(m => m.id === task.assignee_id);
                  const overdue = new Date(task.due_date) < new Date();
                  return (
                    <div key={task.id} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${overdue ? "bg-red-500" : PRIORITY_DOT[task.priority]}`} />
                      <span className="flex-1 text-slate-700 dark:text-slate-300 truncate">{task.title}</span>
                      <span className="flex-shrink-0 text-xs text-slate-400">{owner?.name.split(" ")[0]}</span>
                      <span className={`flex-shrink-0 text-xs font-medium ${overdue ? "text-red-600" : "text-slate-500"}`}>{format(new Date(task.due_date), "MMM d")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Member Workload</h3>
            <div className="space-y-4">
              {members.map(m => {
                const myTasks = tasks.filter(t => t.assignee_id === m.id);
                const done = myTasks.filter(t => t.status === "done").length;
                const pct = myTasks.length ? Math.round((done / myTasks.length) * 100) : 0;
                return (
                  <div key={m.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{m.avatar}</div>
                      <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-800 dark:text-slate-200">{m.name.split(" ")[0]}</span><span className="text-xs text-slate-400">{done}/{myTasks.length}</span></div></div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
