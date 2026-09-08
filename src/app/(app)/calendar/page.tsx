"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, getDay, addMonths, subMonths } from "date-fns";

interface Deadline { id: string; title: string; due_date: string; type: string; risk: string; }

export default function CalendarPage() {
  const { t, dir } = useI18n();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/deadlines?view=all").then(r => { if (r.ok) r.json().then(setDeadlines); });
  }, []);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPadding = getDay(days[0]);

  function getDeadlinesForDay(day: Date) {
    return deadlines.filter(d => isSameDay(parseISO(d.due_date), day));
  }

  const riskColor: Record<string, string> = {
    safe: "bg-emerald-500",
    due_soon: "bg-amber-400",
    at_risk: "bg-orange-500",
    overdue: "bg-red-600",
  };

  const selectedDeadlines = selected ? getDeadlinesForDay(selected) : [];

  return (
    <div className="p-6 space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("calendar.title")}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="btn-ghost"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-32 text-center">{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="btn-ghost"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Padding */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="h-20 border-b border-e border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" />
          ))}

          {days.map(day => {
            const items = getDeadlinesForDay(day);
            const sel = selected && isSameDay(day, selected);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelected(sel ? null : day)}
                className={`h-20 p-1.5 border-b border-e border-slate-100 dark:border-slate-800 cursor-pointer transition-colors
                  ${sel ? "bg-brand-50 dark:bg-brand-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${today ? "bg-brand-600 text-white" : "text-slate-700 dark:text-slate-300"}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {items.slice(0, 2).map(item => (
                    <div key={item.id} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${riskColor[item.risk] || "bg-slate-400"}`} />
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{item.title}</p>
                    </div>
                  ))}
                  {items.length > 2 && <p className="text-[10px] text-slate-400">+{items.length - 2} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            {format(selected, "EEEE, MMMM d, yyyy")}
          </h3>
          {selectedDeadlines.length === 0 ? (
            <p className="text-sm text-slate-400">{t("calendar.noEvents")}</p>
          ) : (
            <div className="space-y-2">
              {selectedDeadlines.map(d => (
                <div key={d.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${riskColor[d.risk] || "bg-slate-400"}`} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{d.title}</span>
                  <span className="badge-gray">{d.type}</span>
                  <span className="text-slate-400 ms-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(d.due_date), "h:mm a")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
