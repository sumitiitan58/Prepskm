import React, { useState } from 'react';
import { Bell, Flame, Target, BookOpen, Sparkles, Check, X, ShieldAlert } from 'lucide-react';

export interface StudyNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'streak' | 'exam' | 'material' | 'mentorship';
  read: boolean;
}

interface StudyNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  targetExam: string;
}

export const StudyNotificationModal: React.FC<StudyNotificationModalProps> = ({
  isOpen,
  onClose,
  streak,
  targetExam,
}) => {
  const [notifications, setNotifications] = useState<StudyNotification[]>([
    {
      id: 'notif-1',
      title: `${streak}-Day Study Streak Active! 🔥`,
      message: 'Consistency beats intensity! Attempt at least 1 balanced CBT mock test today to keep your streak burning.',
      time: '10 mins ago',
      type: 'streak',
      read: false,
    },
    {
      id: 'notif-2',
      title: `${targetExam} Countdown & Strategy 🚨`,
      message: 'Revision phase is critical. Revise handwritten formula sheets and prioritize High-Weightage backlogs.',
      time: '1 hour ago',
      type: 'exam',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'New High-Yield PYQs Added 📚',
      message: 'Mechanics and Organic Chemistry solved question sheets have been updated in the Study Materials Hub.',
      time: 'Yesterday',
      type: 'material',
      read: true,
    },
    {
      id: 'notif-4',
      title: '1:1 Personal Mentorship Pass ⚡',
      message: 'Get your timetable and exam anxiety sorted with @unfiltereddsumit at flat ₹5/min with instant verified token.',
      time: '2 days ago',
      type: 'mentorship',
      read: true,
    },
  ]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: StudyNotification['type']) => {
    switch (type) {
      case 'streak':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'exam':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'material':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'mentorship':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] mt-12 sm:mt-0">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Study Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Timely study alerts, streak reminders & updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Distraction-free notification feed</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                item.read
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-80'
                  : 'bg-slate-950 border-indigo-500/30 shadow-md'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <span className="text-[10px] text-slate-500 font-medium">{item.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Got it, back to study
          </button>
        </div>
      </div>
    </div>
  );
};
