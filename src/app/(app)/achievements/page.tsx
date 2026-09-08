"use client";

import { useState, useEffect } from "react";
import { Star, Zap, BookOpen, Target, TrendingUp, Award, Flame, Brain, Clock, CheckSquare, Trophy, Lock } from "lucide-react";

interface Badge {
  id: string; icon: React.ReactNode; title: string; description: string;
  earned: boolean; earnedDate?: string; category: string;
  progress?: number; target?: number; color: string;
}

interface StatCard { label: string; value: string | number; icon: React.ReactNode; color: string; }

// SVG Donut chart component
function DonutChart({ pct, size = 80, stroke = 10, color = "#6366f1" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-100 dark:text-slate-800" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

// SVG Bar chart component
function MiniBarChart({ data, labels, color = "#6366f1" }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-sm transition-all" style={{ height: `${(v / max) * 48}px`, backgroundColor: color, opacity: 0.8 + i * 0.03 }} />
          <span className="text-[10px] text-slate-400 truncate w-full text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

const BADGES: Badge[] = [
  { id: "b-01", icon: <Flame className="w-6 h-6" />, title: "7-Day Streak", description: "Logged in and studied 7 days in a row", earned: true, earnedDate: "May 1, 2026", category: "Consistency", color: "from-orange-400 to-red-500" },
  { id: "b-02", icon: <BookOpen className="w-6 h-6" />, title: "Study Pack Creator", description: "Generated your first AI Study Pack", earned: true, earnedDate: "Apr 15, 2026", category: "Learning", color: "from-violet-400 to-purple-600" },
  { id: "b-03", icon: <Brain className="w-6 h-6" />, title: "Quiz Master", description: "Scored 90%+ on 3 quizzes", earned: true, earnedDate: "Apr 22, 2026", category: "Academic", color: "from-blue-400 to-indigo-600" },
  { id: "b-04", icon: <CheckSquare className="w-6 h-6" />, title: "Task Champion", description: "Completed 50 tasks across all courses", earned: true, earnedDate: "Apr 28, 2026", category: "Productivity", color: "from-emerald-400 to-teal-600" },
  { id: "b-05", icon: <Target className="w-6 h-6" />, title: "On-Time Achiever", description: "Submitted 10 assignments before deadline", earned: true, earnedDate: "May 3, 2026", category: "Productivity", color: "from-amber-400 to-yellow-500" },
  { id: "b-06", icon: <Zap className="w-6 h-6" />, title: "AI Power User", description: "Used AI Tutor for 100+ sessions", earned: false, category: "Learning", color: "from-yellow-400 to-orange-500", progress: 47, target: 100 },
  { id: "b-07", icon: <TrendingUp className="w-6 h-6" />, title: "Grade Climber", description: "Improved overall GPA by 5+ points", earned: false, category: "Academic", color: "from-green-400 to-emerald-600", progress: 3, target: 5 },
  { id: "b-08", icon: <Star className="w-6 h-6" />, title: "Dean's List", description: "Maintain 85%+ average across all courses", earned: false, category: "Academic", color: "from-amber-400 to-yellow-600", progress: 72, target: 85 },
  { id: "b-09", icon: <Clock className="w-6 h-6" />, title: "30-Day Streak", description: "Logged in and studied 30 days in a row", earned: false, category: "Consistency", color: "from-red-400 to-rose-600", progress: 7, target: 30 },
  { id: "b-10", icon: <Trophy className="w-6 h-6" />, title: "Top Performer", description: "Rank #1 in your cohort for one semester", earned: false, category: "Academic", color: "from-yellow-400 to-amber-600", progress: 0, target: 1 },
  { id: "b-11", icon: <Award className="w-6 h-6" />, title: "Flashcard Fanatic", description: "Reviewed 500 flashcards total", earned: false, category: "Learning", color: "from-pink-400 to-rose-500", progress: 120, target: 500 },
  { id: "b-12", icon: <BookOpen className="w-6 h-6" />, title: "Course Completionist", description: "Reach 100% progress on 3 courses", earned: false, category: "Academic", color: "from-indigo-400 to-brand-600", progress: 0, target: 3 },
];

const WEEKLY_STUDY = [12, 18, 15, 22, 16, 20, 14];
const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCORE_TREND = [71, 74, 73, 78, 76, 80, 82];

export default function AchievementsPage() {
  const [filter, setFilter] = useState("all");
  const [grades, setGrades] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/grades"), fetch("/api/courses")]).then(async ([gr, cr]) => {
      if (gr.ok) setGrades(await gr.json());
      if (cr.ok) setCourses(await cr.json());
    });
  }, []);

  const earned = BADGES.filter(b => b.earned).length;
  const categories = ["all", ...Array.from(new Set(BADGES.map(b => b.category)))];
  const visible = filter === "all" ? BADGES : BADGES.filter(b => b.category === filter);

  // Compute average grade from real data
  const overallPct = courses.length && grades.length
    ? Math.round(courses.reduce((sum, c) => {
        const cg = grades.filter((g: any) => g.course_id === c.id && g.score != null);
        if (!cg.length) return sum;
        const tw = cg.reduce((s: number, g: any) => s + g.weight, 0);
        const ws = cg.reduce((s: number, g: any) => s + (g.score / g.max_score) * g.weight, 0);
        return sum + (tw > 0 ? (ws / tw) * 100 : 0);
      }, 0) / courses.length)
    : 74;

  const STATS: StatCard[] = [
    { label: "Badges Earned", value: `${earned}/${BADGES.length}`, icon: <Trophy className="w-5 h-5" />, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
    { label: "Current Streak", value: "7 days", icon: <Flame className="w-5 h-5" />, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
    { label: "Overall GPA", value: `${overallPct}%`, icon: <Star className="w-5 h-5" />, color: "text-brand-600 bg-brand-50 dark:bg-brand-900/20" },
    { label: "AI Sessions", value: "47", icon: <Brain className="w-5 h-5" />, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Achievements
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your learning milestones and academic performance</p>
        </div>
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <DonutChart pct={Math.round((earned / BADGES.length) * 100)} size={88} stroke={10} color="#6366f1" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{Math.round((earned / BADGES.length) * 100)}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{earned} of {BADGES.length} badges</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">Study Hours This Week</h3>
          <p className="text-xs text-slate-400 mb-4">Total: {WEEKLY_STUDY.reduce((a, b) => a + b, 0)} hours</p>
          <MiniBarChart data={WEEKLY_STUDY} labels={WEEKLY_LABELS} color="#6366f1" />
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">Score Trend (Last 7 Weeks)</h3>
          <p className="text-xs text-slate-400 mb-4">Improving +11 points over 7 weeks</p>
          <MiniBarChart data={SCORE_TREND} labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]} color="#10b981" />
        </div>
      </div>

      {/* Course progress rings */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Course Progress Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {(courses.length ? courses : [
            { name: "Strategic Management", code: "MGMT 601", progress: 78, color: "#6366f1" },
            { name: "Financial Analysis", code: "FIN 502", progress: 65, color: "#0ea5e9" },
            { name: "Operations", code: "OPS 503", progress: 82, color: "#10b981" },
            { name: "Digital Marketing", code: "MKT 604", progress: 90, color: "#f59e0b" },
            { name: "Leadership & OB", code: "HRM 501", progress: 55, color: "#ec4899" },
          ]).map((c: any) => (
            <div key={c.id ?? c.code} className="flex flex-col items-center gap-2">
              <div className="relative inline-flex items-center justify-center">
                <DonutChart pct={c.progress ?? 70} size={72} stroke={8} color={c.color ?? "#6366f1"} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{c.progress ?? 70}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">{c.code}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge filters */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">All Badges</h2>
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${filter === cat ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(badge => (
            <div
              key={badge.id}
              className={`card transition-all ${badge.earned ? "hover:shadow-lg" : "opacity-70 grayscale"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                  {badge.earned ? badge.icon : <Lock className="w-5 h-5 opacity-60" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{badge.title}</p>
                    {badge.earned && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{badge.description}</p>
                  {badge.earned && badge.earnedDate && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">✓ Earned {badge.earnedDate}</p>
                  )}
                  {!badge.earned && badge.progress !== undefined && badge.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{badge.progress} / {badge.target}</span>
                        <span>{Math.round((badge.progress / badge.target) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                        <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
