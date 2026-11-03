import React from 'react';
import {
  Search,
  Youtube,
  Instagram,
  Send,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Flame,
  BookOpen,
  GraduationCap,
  Layers,
  Megaphone,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { isUserAdmin } from '../lib/firebase';

interface NavbarProps {
  currentTab: 'tracker' | 'materials' | 'mock_tests' | 'mentorship' | 'admin';
  onSelectTab: (tab: 'tracker' | 'materials' | 'mock_tests' | 'mentorship' | 'admin') => void;
  studentProfile: StudentProfile;
  currentUser: any;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
  onOpenCampaign: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  studentProfile,
  currentUser,
  onOpenSearch,
  onOpenAuth,
  onOpenOnboarding,
  onOpenCampaign,
  onLogout,
}) => {
  const isAdmin = currentUser && isUserAdmin(currentUser.email);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-950 border-b border-indigo-500/10 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <span className="font-extrabold text-indigo-400">PREPSKM</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="truncate">Founded by @unfiltereddsumit for JEE & NEET Aspirants</span>
        </div>

        {/* Creator social links */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://t.me/prepskm"
            target="_blank"
            rel="noreferrer"
            title="Telegram Channel @prepskm"
            className="flex items-center gap-1 hover:text-sky-400 transition"
          >
            <Send className="w-3.5 h-3.5" /> <span className="hidden md:inline">@prepskm</span>
          </a>
          <a
            href="https://t.me/unfiltreddsumit"
            target="_blank"
            rel="noreferrer"
            title="Telegram Chat @unfiltreddsumit"
            className="flex items-center gap-1 hover:text-sky-300 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" /> <span className="hidden md:inline">@unfiltreddsumit</span>
          </a>
          <a
            href="https://youtube.com/@unfiltereddsumit"
            target="_blank"
            rel="noreferrer"
            title="YouTube @unfiltereddsumit"
            className="hover:text-rose-400 transition"
          >
            <Youtube className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://instagram.com/unfiltereddsumit"
            target="_blank"
            rel="noreferrer"
            title="Instagram @unfiltereddsumit"
            className="hover:text-pink-400 transition"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab('tracker')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl text-white tracking-tight group-hover:text-indigo-300 transition">
                  Prepskm
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5">by @unfiltereddsumit</p>
            </div>
          </div>
        </div>

        {/* Universal Search Bar Button */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Search chapters, notes, PYQs, tests...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-500 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Navigation & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Campaign Promo Hub */}
          <button
            onClick={onOpenCampaign}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition"
            title="Launch Promotional Scripts"
          >
            <Megaphone className="w-4 h-4" />
          </button>

          {/* Student Profile & Target Exam Badge */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition"
            title="Click to edit student profile"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
              {studentProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-xs">
              <p className="font-bold text-white truncate max-w-[90px]">{studentProfile.name}</p>
              <p className="text-[10px] text-indigo-400">{studentProfile.targetExam}</p>
            </div>
          </button>

          {/* Strictly Protected Admin Panel Button (ONLY VISIBLE TO AUTHENTICATED ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition shadow-lg ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Auth Button */}
          {currentUser ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
              title={`Sign Out (${currentUser.email})`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800/40 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => onSelectTab('tracker')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition shrink-0 ${
            currentTab === 'tracker'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Backlog Destroyer</span>
        </button>

        <button
          onClick={() => onSelectTab('materials')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition shrink-0 ${
            currentTab === 'materials'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Study Materials Hub</span>
        </button>

        <button
          onClick={() => onSelectTab('mock_tests')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition shrink-0 ${
            currentTab === 'mock_tests'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>NTA CBT Mock Tests</span>
        </button>

        <button
          onClick={() => onSelectTab('mentorship')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition shrink-0 ${
            currentTab === 'mentorship'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>1:1 Mentorship (₹5/min)</span>
        </button>
      </div>
    </header>
  );
};
