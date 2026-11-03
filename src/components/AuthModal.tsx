import React, { useState } from 'react';
import { X, Lock, ShieldAlert, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import { loginWithGoogle, getStudentProfile } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Google Sign-In failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Auth error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    const profile = getStudentProfile();
    const guestUser = {
      uid: 'guest-' + Date.now(),
      email: 'guest@aspirant.prepskm.com',
      displayName: profile.name || 'Guest Aspirant',
      isGuest: true
    };
    localStorage.setItem('prepskm_mock_user', JSON.stringify(guestUser));
    window.dispatchEvent(new CustomEvent('prepskm_auth_state_changed', { detail: guestUser }));
    onSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                  Welcome to Prepskm
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Distraction-Free JEE & NEET Hub</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Info Badge */}
          <div className="mt-5 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white">Seamless 1-Click Access</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Sign in with Google to sync your study streaks, test scores, and mentor access. No password needed!
              </p>
            </div>
          </div>

          {/* 2 Exclusive Options: 1) Google Auth, 2) Continue as Guest */}
          <div className="mt-6 space-y-3">
            {/* Primary Option: Google Sign In */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-extrabold text-sm transition flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 dark:shadow-white/10 disabled:opacity-60 active:scale-98 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 text-[10px] font-bold">
                  OR
                </span>
              </div>
            </div>

            {/* Secondary Option: Continue as Guest */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGuestContinue}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Continue as Guest</span>
            </button>
          </div>

          {/* Micro Footer Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Super Admins & Mentors get automatic panel access upon Google login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
