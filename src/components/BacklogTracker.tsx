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
} from 'lucide-react';
import { BacklogItem, SubjectName } from '../types';
import { saveBacklog, deleteBacklog } from '../lib/firebase';
import { AVAILABLE_CHAPTERS } from '../data/initialData';

interface BacklogTrackerProps {
  backlogs: BacklogItem[];
  streakCount: number;
}

export const BacklogTracker: React.FC<BacklogTrackerProps> = ({ backlogs, streakCount }) => {
  const [selectedSubject, setSelectedSubject] = useState<'All' | SubjectName>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'cleared'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newSubject, setNewSubject] = useState<SubjectName>('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredItems = backlogs.filter((item) => {
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSubject && matchesStatus;
  });

  const totalCount = backlogs.length;
  const clearedCount = backlogs.filter((b) => b.status === 'cleared').length;
  const progressPercent = totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0;

  const handleStatusChange = async (item: BacklogItem, nextStatus: 'pending' | 'in_progress' | 'cleared') => {
    const updated: BacklogItem = { ...item, status: nextStatus };
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
      targetDate: newTargetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: newNotes.trim(),
    };

    await saveBacklog(newItem);
    setNewChapter('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Backlog Clearance</span>
            <span className="text-2xl font-black text-white">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>{clearedCount} Cleared</span>
            <span>{totalCount - clearedCount} Remaining</span>
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/20 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Active Study Streak
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{streakCount}</span>
              <span className="text-sm font-semibold text-amber-300">Days Consecutive 🔥</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Don't break the chain before JEE/NEET!</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
            <Flame className="w-8 h-8 fill-amber-400/20" />
          </div>
        </div>

        {/* Action Quick Launch */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Backlogs</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Synced to Firestore
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-2xl font-black text-white">{totalCount} Chapters</p>
              <p className="text-xs text-slate-400">Priority-driven study queue</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Chapter
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
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
                  ? 'bg-slate-800 border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Backlog List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Backlogs Found!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Either you've cleared everything or no chapters match this filter. Keep the momentum going!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-400 transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Chapter to Backlog
            </button>
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
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : isInProgress
                    ? 'bg-slate-900 border-indigo-500/30 shadow-sm'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => {
                      const next = isCleared ? 'pending' : isInProgress ? 'cleared' : 'in_progress';
                      handleStatusChange(item, next);
                    }}
                    title="Click to advance status"
                    className={`mt-0.5 p-2 rounded-xl border transition ${
                      isCleared
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : isInProgress
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isCleared ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-500" />
                    )}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                      {item.targetDate && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> Target: {item.targetDate}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm sm:text-base font-semibold truncate ${
                        isCleared ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {item.chapter}
                    </h4>

                    {item.notes && <p className="text-xs text-slate-400 line-clamp-1">{item.notes}</p>}
                  </div>
                </div>

                {/* Status Switcher & Delete */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['pending', 'in_progress', 'cleared'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(item, st)}
                        className={`px-2.5 py-1 rounded-lg capitalize transition text-[11px] font-medium ${
                          item.status === st
                            ? st === 'cleared'
                              ? 'bg-emerald-600 text-white'
                              : st === 'in_progress'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Backlog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">Add Chapter to Backlog</h3>
            <p className="text-xs text-slate-400 mb-4">Set target date and priority to schedule into your study queue.</p>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => {
                    setNewSubject(e.target.value as SubjectName);
                    setNewChapter('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Chapter</label>
                <input
                  type="text"
                  required
                  list="syllabus-chapters"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. Rotational Motion or Thermodynamics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <datalist id="syllabus-chapters">
                  {AVAILABLE_CHAPTERS[newSubject]?.map((ch) => (
                    <option key={ch} value={ch} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">High (High Weightage)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Study Goal / Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Complete 30 PYQs & revise formula sheet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition"
                >
                  Save to Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
