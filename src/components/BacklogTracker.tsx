import React, { useState } from 'react';
import {
  Flame,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  Filter,
  Sparkles,
  TrendingUp,
  Target,
  CheckSquare,
  Square,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Check,
  Zap,
  ListTodo
} from 'lucide-react';
import { BacklogItem, SubjectName, BacklogSubtask } from '../types';
import { saveBacklog, deleteBacklog } from '../lib/firebase';
import { AVAILABLE_CHAPTERS } from '../data/initialData';

interface BacklogTrackerProps {
  backlogs: BacklogItem[];
  streakCount: number;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const BacklogTracker: React.FC<BacklogTrackerProps> = ({ backlogs, streakCount }) => {
  const [selectedSubject, setSelectedSubject] = useState<'All' | SubjectName>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'cleared'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // New item form state
  const [newSubject, setNewSubject] = useState<SubjectName>('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTargetDate, setNewTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  // AI Breakdown states
  const [aiSubject, setAiSubject] = useState<SubjectName>('Physics');
  const [aiChapter, setAiChapter] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    recommendedHours: number;
    highYieldTopics: string[];
    tasks: Array<{ title: string; estMinutes: number }>;
    proTip: string;
  } | null>(null);

  // Current Day detection
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const todayName = DAYS_OF_WEEK[todayIndex];
  const todayDateStr = new Date().toISOString().split('T')[0];

  const filteredItems = backlogs.filter((item) => {
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSubject && matchesStatus;
  });

  // Today's targets: items with targetDate === todayDateStr OR dayOfWeek === todayName OR marked pending with targetDate <= today
  const todayTargets = backlogs.filter((item) => {
    return item.targetDate === todayDateStr || item.dayOfWeek === todayName;
  });

  const todayCompletedCount = todayTargets.filter((t) => t.status === 'cleared').length;
  const todayTotalCount = todayTargets.length;
  const todayProgressPercent = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const totalCount = backlogs.length;
  const clearedCount = backlogs.filter((b) => b.status === 'cleared').length;
  const overallProgressPercent = totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0;

  const triggerConfetti = () => {
    if (typeof (window as any).confetti === 'function') {
      (window as any).confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleStatusChange = async (item: BacklogItem, nextStatus: 'pending' | 'in_progress' | 'cleared') => {
    const updated: BacklogItem = { ...item, status: nextStatus };
    if (nextStatus === 'cleared') {
      triggerConfetti();
    }
    await saveBacklog(updated);
  };

  const handleToggleSubtask = async (item: BacklogItem, subtaskId: string) => {
    if (!item.subtasks) return;
    const updatedSubtasks = item.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const allDone = updatedSubtasks.every((st) => st.completed);
    const updated: BacklogItem = {
      ...item,
      subtasks: updatedSubtasks,
      status: allDone ? 'cleared' : 'in_progress',
    };
    if (allDone) {
      triggerConfetti();
    }
    await saveBacklog(updated);
  };

  const handleDelete = async (id: string) => {
    await deleteBacklog(id);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.trim()) return;

    const newItem: BacklogItem = {
      id: 'bl-' + Date.now(),
      subject: newSubject,
      chapter: newChapter.trim(),
      priority: newPriority,
      status: 'pending',
      targetDate: newTargetDate || todayDateStr,
      dayOfWeek: todayName,
      notes: newNotes.trim(),
    };

    await saveBacklog(newItem);
    setNewChapter('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleGenerateAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChapter.trim()) return;

    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/prep-ai/backlog-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject,
          chapter: aiChapter.trim(),
          examTarget: 'JEE Main'
        })
      });
      const data = await res.json();
      if (data.plan) {
        setAiResult(data.plan);
      }
    } catch (err) {
      console.warn('AI Breakdown request note:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAiPlanToBacklog = async () => {
    if (!aiResult) return;

    const subtasks: BacklogSubtask[] = aiResult.tasks.map((t, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      title: t.title,
      estMinutes: t.estMinutes,
      completed: false,
    }));

    const newItem: BacklogItem = {
      id: 'bl-' + Date.now(),
      subject: aiSubject,
      chapter: aiChapter.trim(),
      priority: 'high',
      status: 'pending',
      targetDate: todayDateStr,
      dayOfWeek: todayName,
      notes: `AI High-Yield: ${aiResult.highYieldTopics.join(', ')} • ${aiResult.proTip}`,
      subtasks,
      aiGenerated: true,
    };

    await saveBacklog(newItem);
    triggerConfetti();
    setShowAiModal(false);
    setAiResult(null);
    setAiChapter('');
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Total Backlog Clearance
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {overallProgressPercent}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{clearedCount} Chapters Cleared</span>
            <span>{totalCount - clearedCount} Remaining</span>
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
              Active Study Streak
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{streakCount}</span>
              <span className="text-sm font-semibold text-amber-500">Days Active 🔥</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consistency creates AIR 1!</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Flame className="w-8 h-8 fill-amber-500/20" />
          </div>
        </div>

        {/* Action & AI Launch Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Backlog Destroyer
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live Cloud Sync
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Study Planner</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chapter</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== WEEKLY SCHEDULE & TODAY'S TARGET TRACKER ==================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-50/60 to-white dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm space-y-6">
        {/* Header & Day Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-xs uppercase tracking-wide">
                Weekly Schedule
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Today is {todayName}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Aaj Ka Target & Weekly Planner
            </h3>
          </div>

          {/* 7 Days Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {DAYS_OF_WEEK.map((day, idx) => {
              const isToday = day === todayName;
              const countForDay = backlogs.filter(
                (b) => b.dayOfWeek === day || (isToday && b.targetDate === todayDateStr)
              ).length;

              return (
                <div
                  key={day}
                  className={`px-3 py-2 rounded-2xl flex flex-col items-center min-w-[58px] transition border ${
                    isToday
                      ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {day.slice(0, 3)}
                  </span>
                  <span className="text-sm font-black mt-0.5">
                    {countForDay}
                  </span>
                  {isToday && (
                    <span className="text-[9px] bg-white/20 px-1 rounded uppercase tracking-tight mt-0.5 font-bold">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* "Aaj Ka Target" Focus Box */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Aaj Ka Target Progress
              </p>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {todayTotalCount === 0
                  ? 'No targets set for today yet!'
                  : `${todayProgressPercent}% Complete • (${todayCompletedCount} of ${todayTotalCount} Targets Finished)`}
              </h4>
            </div>

            {/* Quick Add Target for Today */}
            <button
              onClick={() => {
                setNewTargetDate(todayDateStr);
                setShowAddModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Set Target for Today</span>
            </button>
          </div>

          {/* Progress bar */}
          {todayTotalCount > 0 && (
            <div className="space-y-1.5">
              <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-right font-bold text-emerald-600 dark:text-emerald-400">
                {todayCompletedCount === todayTotalCount && todayTotalCount > 0
                  ? '🎉 All targets completed today! Phenomenal work!'
                  : `${todayTotalCount - todayCompletedCount} tasks pending for today`}
              </p>
            </div>
          )}

          {/* Today's Target List */}
          {todayTargets.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              <ListTodo className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
              <p className="font-semibold">Aaj ka koi target scheduled nahi hai.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click "+ Set Target for Today" ya "AI Study Planner" se aaj ka schedule taiyar karein!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTargets.map((item) => {
                const isCleared = item.status === 'cleared';
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCleared
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 opacity-80'
                        : 'bg-slate-50/70 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          handleStatusChange(item, isCleared ? 'pending' : 'cleared')
                        }
                        className="mt-0.5 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition shrink-0"
                        title={isCleared ? 'Mark as Pending' : 'Mark as Cleared'}
                      >
                        {isCleared ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-slate-400 hover:border-indigo-600" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.chapter}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                            {item.subject}
                          </span>
                          {item.aiGenerated && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> AI Plan
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.notes}
                          </p>
                        )}

                        {/* Interactive Subtasks */}
                        {item.subtasks && item.subtasks.length > 0 && (
                          <div className="pt-2 space-y-1">
                            {item.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => handleToggleSubtask(item, st.id)}
                                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                {st.completed ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span className={st.completed ? 'line-through opacity-60' : ''}>
                                  {st.title} {st.estMinutes ? `(${st.estMinutes}m)` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Control Bar for All Backlogs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {(['all', 'pending', 'in_progress', 'cleared'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg border text-xs capitalize transition ${
                statusFilter === st
                  ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* All Backlogs List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">No Backlogs Found!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Either you've cleared everything or no chapters match this filter. Keep the momentum going!
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCleared = item.status === 'cleared';
            const isInProgress = item.status === 'in_progress';
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCleared
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
                    : isInProgress
                    ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-500/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        item,
                        isCleared ? 'pending' : isInProgress ? 'cleared' : 'in_progress'
                      )
                    }
                    className="mt-1 text-slate-400 hover:text-indigo-600 transition shrink-0"
                    title="Toggle Status"
                  >
                    {isCleared ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5 text-indigo-500 animate-pulse" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {item.chapter}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                        {item.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Target: {item.targetDate}
                      </span>
                      {item.dayOfWeek && (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          • {item.dayOfWeek}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item, e.target.value as 'pending' | 'in_progress' | 'cleared')
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="cleared">Cleared</option>
                  </select>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Add Backlog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Add Chapter to Backlog
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Subject
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value as SubjectName)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. Rotational Motion or Thermodynamics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Notes / Focus Weak Areas
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Needs formula derivations and 2024 PYQs practice"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save to Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Backlog Breakdown & Planner Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    AI Syllabus Breakdown & Smart Planner
                  </h3>
                  <p className="text-xs text-slate-500">
                    Auto-decompose difficult chapters into actionable 30-min milestones
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setAiResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <form onSubmit={handleGenerateAiPlan} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Subject
                    </label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value as SubjectName)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Chapter Name
                    </label>
                    <input
                      type="text"
                      required
                      value={aiChapter}
                      onChange={(e) => setAiChapter(e.target.value)}
                      placeholder="e.g. Rotational Dynamics or Equilibrium"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiLoading ? 'Decomposing Syllabus via AI...' : 'Generate AI Study Plan'}</span>
                </button>
              </form>

              {/* AI Plan Output */}
              {aiResult && (
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-purple-950 dark:text-purple-200">
                      Recommended Hours: {aiResult.recommendedHours} hrs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px] uppercase">
                      High Yield
                    </span>
                  </div>

                  {/* High Yield Topics */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase">
                      High Frequency NTA Concepts:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.highYieldTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-800 dark:text-purple-300 font-semibold"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tasks Checklist */}
                  <div className="space-y-1.5 pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase">
                      Actionable Milestones:
                    </p>
                    {aiResult.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                          {i + 1}. {task.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 shrink-0">
                          {task.estMinutes} mins
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  {aiResult.proTip && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
                      <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{aiResult.proTip}</span>
                    </div>
                  )}

                  {/* Add to Backlog Action */}
                  <button
                    onClick={handleAddAiPlanToBacklog}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Add Plan to My Backlog & Aaj Ka Target</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
