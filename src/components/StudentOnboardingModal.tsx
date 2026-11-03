import React, { useState, useEffect } from 'react';
import { Sparkles, Target, GraduationCap, ArrowRight, CheckCircle2, X, User, LogOut, Mail, Shield } from 'lucide-react';
import { StudentProfile, ExamTarget } from '../types';
import { saveStudentProfile, logout } from '../lib/firebase';

interface StudentOnboardingModalProps {
  initialProfile: StudentProfile;
  isOpen: boolean;
  onClose: (profile: StudentProfile) => void;
  currentUser?: any;
}

const EXAM_OPTIONS: { label: ExamTarget; description: string; badge: string }[] = [
  { label: 'JEE Main', description: 'NTA CBT mock tests, Physics, Chem & Maths', badge: 'Engineering' },
  { label: 'JEE Advanced', description: 'IIT Entrance multi-correct & advanced numericals', badge: 'Engineering' },
  { label: 'NEET', description: 'Medical entrance, NCERT Biology 360 & high-yield PYQs', badge: 'Medical' },
  { label: 'Class 12', description: 'Board theory derivations + Competitive foundation', badge: 'School + Prep' },
  { label: 'Class 11', description: 'Mechanics, Organic fundamentals & clearing backlogs', badge: 'Foundation' },
  { label: 'Dropper', description: 'Full syllabus intensive speed & mock test drill', badge: 'Repeaters' },
  { label: 'Class 10', description: 'Board booster & early JEE/NEET prep', badge: 'School' },
  { label: 'Class 9', description: 'Olympiads, NTSE & STEM fundamentals', badge: 'Foundation' },
  { label: 'Others', description: 'General competitive science preparation', badge: 'General' },
];

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  initialProfile,
  isOpen,
  onClose,
  currentUser,
}) => {
  const [name, setName] = useState(initialProfile.name === 'Aspirant' ? '' : initialProfile.name);
  const [selectedExam, setSelectedExam] = useState<ExamTarget>(initialProfile.targetExam || 'JEE Main');
  const [selectedClass, setSelectedClass] = useState<string>(initialProfile.classLevel || 'Class 12');

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name === 'Aspirant' ? '' : initialProfile.name);
      setSelectedExam(initialProfile.targetExam || 'JEE Main');
      setSelectedClass(initialProfile.classLevel || 'Class 12');
    }
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Aspirant';
    const updated: StudentProfile = {
      ...initialProfile,
      name: finalName,
      targetExam: selectedExam,
      classLevel: selectedClass,
      lastActiveDate: new Date().toISOString(),
    };
    saveStudentProfile(updated);
    onClose(updated);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      const guestProfile: StudentProfile = {
        name: 'Aspirant',
        targetExam: 'JEE Main',
        classLevel: 'Class 12',
        streakCount: 1,
        lastActiveDate: new Date().toISOString(),
        totalTestsTaken: 0,
        averageScorePercent: 0,
      };
      saveStudentProfile(guestProfile);
      onClose(guestProfile);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isFirstTime = !localStorage.getItem('prepskm_onboarded');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Glow decorative blur */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-800 flex items-center justify-between relative z-10 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                {isFirstTime ? 'Student Onboarding' : 'Edit Student Profile & Account'}
              </h3>
              <p className="text-[11px] text-slate-400">Prepskm Learning Engine by @unfiltereddsumit</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose(initialProfile)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info Bar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {currentUser?.email ? (
                <span>
                  Account: <strong className="text-white">{currentUser.email}</strong>
                </span>
              ) : (
                <span className="text-slate-400">Guest Student Mode (Cloud sync via browser)</span>
              )}
            </span>
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 relative z-10 flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (e.g. Aryan Sharma)"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            {/* Target Exam Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Exam / Focus
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {EXAM_OPTIONS.map((exam) => {
                  const isSelected = selectedExam === exam.label;
                  return (
                    <button
                      key={exam.label}
                      type="button"
                      onClick={() => setSelectedExam(exam.label)}
                      className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{exam.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 line-clamp-1 block">
                          {exam.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Class Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Class / Standard
              </label>
              <div className="flex flex-wrap gap-2">
                {['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Dropper'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selectedClass === cls
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onClose(initialProfile)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition transform active:scale-[0.99]"
              >
                Save & Update Profile <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
