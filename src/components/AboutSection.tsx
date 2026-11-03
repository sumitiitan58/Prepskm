import React, { useState } from 'react';
import {
  GraduationCap,
  Flame,
  BookOpen,
  Sparkles,
  Send,
  MessageSquare,
  Youtube,
  Instagram,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Target,
  Award,
  Zap,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AboutSectionProps {
  onStartMockTest: () => void;
  onOpenBacklog: () => void;
  onBookMentor: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onStartMockTest,
  onOpenBacklog,
  onBookMentor,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'What makes Prepskm different from traditional edtech apps?',
      a: 'Prepskm was built specifically to eliminate digital distraction and coaching noise. Instead of endless 10-hour livestream clickbaits and fake motivation, we give you 3 focused tools: a NTA-standard CBT Mock Test simulator (80% MCQs + 20% NATs), a high-yield Backlog Destroyer, and 1:1 Mentorship at flat ₹5/minute with no long-term financial traps.'
    },
    {
      q: 'How does the JEE & NEET Mock Test simulation work?',
      a: 'Our mock test portal follows exact NTA exam software patterns: realistic question palette, section switching, timer countdown, review marking, and official marking scheme (+4 for correct, -1 for incorrect, 0 for unattempted). When you choose JEE, questions and subjects are strictly filtered to Physics, Chemistry & Mathematics without mixing NEET Biology.'
    },
    {
      q: 'Is Prepskm really free for students?',
      a: 'Yes! The NTA Mock Test portal, chapter-wise notes, formula sheets, Backlog Tracker, and Prep AI doubt tutor are 100% free to use. For 1:1 personal video/audio strategy calls with Sumit & IITian mentors, we offer flexible pay-as-you-go tokens at flat ₹5/minute via UPI so students never pay ₹50,000 upfront.'
    },
    {
      q: 'How does real-time cloud sync work?',
      a: 'Prepskm connects directly to Google Firebase Firestore in real-time. When you sign in with Google or an email account, your test results, backlog progress, and profile sync live across your phone, tablet, and laptop seamlessly.'
    },
    {
      q: 'How do I connect directly with Sumit and the community?',
      a: 'You can join our main Telegram Channel @prepskm for study materials and daily exam updates, and chat with fellow aspirants and mentors in our Telegram Chat @unfiltreddsumit.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 dark:from-indigo-950/50 dark:via-slate-900 dark:to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Built by @unfiltereddsumit for Serious Aspirants</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Distraction-Free Padhai.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">
              Zero Coaching Hype. Real Results.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            Prepskm is the unified preparation ecosystem created by Sumit (<span className="text-indigo-300 font-semibold">@unfiltereddsumit</span>)
            to rescue JEE, NEET, and Boards aspirants from the vicious cycle of procrastinated backlogs, 
            overpriced coaching institutes, and superficial motivation.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartMockTest}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <GraduationCap className="w-4 h-4" /> Start NTA Mock Test
            </button>
            <button
              onClick={onOpenBacklog}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2 active:scale-95"
            >
              <Flame className="w-4 h-4 text-amber-400" /> Open Backlog Destroyer
            </button>
            <a
              href="https://t.me/prepskm"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs transition flex items-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" /> Join Telegram @prepskm
            </a>
          </div>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Aspirants', val: '15,000+', icon: Users, color: 'text-indigo-400' },
          { label: 'Backlogs Cleared', val: '42,500+', icon: Flame, color: 'text-amber-400' },
          { label: 'CBT Tests Taken', val: '18,900+', icon: GraduationCap, color: 'text-emerald-400' },
          { label: 'Top Mentee Record', val: '99.42 %ile', icon: Award, color: 'text-purple-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm"
            >
              <div className="w-8 h-8 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stat.val}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Founder & Community Connect Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-indigo-600/30 shrink-0">
            S
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Sumit (@unfiltereddsumit)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                Founder & Academic Mentor
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              "IITs aur Top Medical Colleges crack karne ke liye 10 alag coaching modules nahi chahiye. 
              Chahiye toh bas ek honest routine, NCERT + PYQ command, timed NTA CBT practice, aur backlogs se ladne ki himmat. 
              Prepskm isi honesty ka platform hai."
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="https://t.me/prepskm"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" /> Channel @prepskm
              </a>
              <a
                href="https://t.me/unfiltreddsumit"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat @unfiltreddsumit
              </a>
              <a
                href="https://youtube.com/@unfiltereddsumit"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Youtube className="w-3.5 h-3.5" /> YouTube
              </a>
              <a
                href="https://instagram.com/unfiltereddsumit"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Pillars */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            The Prepskm Arsenal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            5 integrated engines built to take you from confused aspirant to rank holder
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: '1. Backlog Destroyer',
              desc: 'High-weightage chapter prioritization, priority flags (High/Medium/Low), and streak counters to clear backlogs step-by-step.',
              icon: Flame,
              badge: 'Streak Powered',
              color: 'text-amber-400',
              action: onOpenBacklog,
              btnText: 'Open Backlogs',
            },
            {
              title: '2. NTA CBT Mock Test Engine',
              desc: 'Balanced 80% MCQs + 20% Numerical NAT questions with exact NTA color palette, section splits, official +4 / -1 marking, and visual question zoom.',
              icon: GraduationCap,
              badge: 'Real Exam Feel',
              color: 'text-emerald-400',
              action: onStartMockTest,
              btnText: 'Create Test',
            },
            {
              title: '3. Handpicked Study Vault',
              desc: 'Curated PDF notes, concise formula sheets, and chapter-wise PYQs without 300-page bloated coaching material.',
              icon: BookOpen,
              badge: 'Free PDFs',
              color: 'text-cyan-400',
              action: undefined,
              btnText: 'Browse Vault',
            },
            {
              title: '4. 1:1 Live Mentorship',
              desc: 'Personalized doubt clearing and strategy sessions at flat ₹5/minute via UPI. Instant token generation with 0 long-term lockins.',
              icon: Sparkles,
              badge: '₹5 / min UPI',
              color: 'text-purple-400',
              action: onBookMentor,
              btnText: 'Book Pass',
            },
            {
              title: '5. Prep AI Doubt & Reality Check',
              desc: 'Instant academic doubt resolution with formulas and derivations, plus reality-check scolding if you waste study hours on gossip.',
              icon: Zap,
              badge: 'Strict Mentor',
              color: 'text-rose-400',
              action: undefined,
              btnText: 'Ask Prep AI',
            },
            {
              title: '6. Realtime Firebase Cloud Sync',
              desc: 'Every completed test, verified marksheet, and cleared backlog syncs in real-time to Google Firebase across your phone and PC.',
              icon: ShieldCheck,
              badge: 'Firebase Live',
              color: 'text-sky-400',
              action: undefined,
              btnText: 'Cloud Active',
            },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-sm hover:border-indigo-500/40 transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${pillar.color}`} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
                </div>

                {pillar.action && (
                  <button
                    onClick={pillar.action}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>{pillar.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Got questions about how Prepskm works? Here are clear answers.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Call to Action Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border border-indigo-500/20 text-center space-y-3">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Join the Disciplined Aspirant Community
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Get daily high-yield questions, revision notes, formula sheets, and live mentorship announcements directly on Telegram.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href="https://t.me/prepskm"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Telegram Channel @prepskm
          </a>
          <a
            href="https://t.me/unfiltreddsumit"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-750 font-bold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Discussion Chat
          </a>
        </div>
      </div>
    </div>
  );
};
