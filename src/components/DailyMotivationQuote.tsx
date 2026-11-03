import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw, Copy, Check, Sparkles, Compass } from 'lucide-react';

export interface MotivationQuote {
  id: number;
  quote: string;
  author: string;
  role: string;
  category: 'Discipline' | 'Deep Focus' | 'Resilience' | 'Exam Temperament' | 'Problem Solving';
}

export const ACADEMIC_QUOTES: MotivationQuote[] = [
  {
    id: 1,
    quote: "If you want to shine like a sun, first burn like a sun. Consistent daily preparation quietly beats sudden bursts of genius.",
    author: "Dr. A.P.J. Abdul Kalam",
    role: "Aerospace Scientist & 11th President of India",
    category: "Discipline"
  },
  {
    id: 2,
    quote: "You have to understand the concepts deeply enough to rebuild the derivation from first principles, not memorize formulas like a parrot.",
    author: "Richard P. Feynman",
    role: "Nobel Laureate in Theoretical Physics",
    category: "Problem Solving"
  },
  {
    id: 3,
    quote: "Mock tests are not character certificates; they are diagnostic X-rays. Every negative mark is an invitation to master an unlearned concept.",
    author: "NTA CBT Strategy Mantra",
    role: "JEE / NEET Ranker Principle",
    category: "Exam Temperament"
  },
  {
    id: 4,
    quote: "It is not that I'm so smart. But I stay with the problems much longer.",
    author: "Albert Einstein",
    role: "Theoretical Physicist",
    category: "Problem Solving"
  },
  {
    id: 5,
    quote: "Take up one idea. Make that one idea your life — think of it, dream of it, live on that idea. Let the brain, muscles, nerves, every part of your body, be full of that idea.",
    author: "Swami Vivekananda",
    role: "Philosopher & Youth Icon",
    category: "Deep Focus"
  },
  {
    id: 6,
    quote: "The impediment to action advances action. What stands in the way becomes the way. Turn your backlogs into your greatest competitive edge.",
    author: "Marcus Aurelius",
    role: "Meditations",
    category: "Resilience"
  },
  {
    id: 7,
    quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie",
    role: "Two-Time Nobel Laureate in Physics & Chemistry",
    category: "Deep Focus"
  },
  {
    id: 8,
    quote: "Never give up on a tough question before you have tried at least three fundamentally distinct approaches.",
    author: "Srinivasa Ramanujan",
    role: "Legendary Mathematician",
    category: "Problem Solving"
  },
  {
    id: 9,
    quote: "A scientist is not judged by how quickly he answers an easy question, but by his persistence in front of an impossible one.",
    author: "Dr. Homi J. Bhabha",
    role: "Father of the Indian Nuclear Programme",
    category: "Resilience"
  },
  {
    id: 10,
    quote: "Discipline is choosing between what you want now and what you want most. 10 hours of focused revision beats 15 hours of distracted sitting.",
    author: "Kota Academic Rigor",
    role: "JEE Advanced Benchmark",
    category: "Discipline"
  },
  {
    id: 11,
    quote: "The greatest discovery of my generation is that a human being can alter his life by altering his attitudes of mind.",
    author: "William James",
    role: "Psychologist & Philosopher",
    category: "Resilience"
  },
  {
    id: 12,
    quote: "Focus on accuracy first, speed second. Speed is an inevitable byproduct of conceptual clarity, never the precursor.",
    author: "Dr. K.C. Sinha",
    role: "Eminent Mathematics Educator",
    category: "Exam Temperament"
  },
  {
    id: 13,
    quote: "Success in competitive exams is not about solving every question; it is about leaving the traps early and executing the doable ones with 100% precision.",
    author: "CBT Tactical Doctrine",
    role: "AIR-1 Selection Strategy",
    category: "Exam Temperament"
  },
  {
    id: 14,
    quote: "Small daily improvements over time lead to stunning results. Even solving 25 solid numericals every single day adds up to over 9,000 problems a year.",
    author: "Compounding Growth Rule",
    role: "Academic Blueprint",
    category: "Discipline"
  },
  {
    id: 15,
    quote: "Your competition is not the 1.5 million students writing the exam. Your real competition is your own procrastination and unanalyzed mistakes.",
    author: "Prepskm Core Philosophy",
    role: "Mentorship Directorate",
    category: "Deep Focus"
  }
];

const CATEGORY_STYLES: Record<MotivationQuote['category'], { badge: string; border: string }> = {
  'Discipline': {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    border: 'from-emerald-500/20 to-teal-500/10'
  },
  'Deep Focus': {
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    border: 'from-indigo-500/20 to-purple-500/10'
  },
  'Resilience': {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    border: 'from-amber-500/20 to-orange-500/10'
  },
  'Exam Temperament': {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    border: 'from-rose-500/20 to-pink-500/10'
  },
  'Problem Solving': {
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
    border: 'from-cyan-500/20 to-blue-500/10'
  }
};

export const DailyMotivationQuote: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Initialize with a randomized quote on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ACADEMIC_QUOTES.length);
    setCurrentIndex(randomIndex);
  }, []);

  const handleNextQuote = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ACADEMIC_QUOTES.length);
      setIsRotating(false);
    }, 180);
  };

  const currentQuote = ACADEMIC_QUOTES[currentIndex] || ACADEMIC_QUOTES[0];
  const styling = CATEGORY_STYLES[currentQuote.category] || CATEGORY_STYLES['Discipline'];

  const handleCopyQuote = async () => {
    const textToCopy = `"${currentQuote.quote}"\n— ${currentQuote.author} (${currentQuote.role}) [via Prepskm.in]`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for restricted webviews
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2200);
    } catch {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2200);
    }
  };

  return (
    <section 
      aria-label="Daily Motivation Quote"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-300"
    >
      {/* Subtle decorative gradient glow */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${styling.border} pointer-events-none opacity-60 dark:opacity-40 transition-colors duration-500`} 
      />

      <div className="relative p-4 sm:p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Quote Icon + Content */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0 mt-0.5">
            <Quote className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Header meta */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-500" /> Daily Motivation
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${styling.badge} transition-colors duration-300`}>
                {currentQuote.category}
              </span>
            </div>

            {/* Quote Body */}
            <blockquote className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug sm:leading-relaxed tracking-tight italic">
              "{currentQuote.quote}"
            </blockquote>

            {/* Author info */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">
                {currentQuote.author}
              </span>
              <span className="text-slate-400 dark:text-slate-500">—</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
                {currentQuote.role}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Action Buttons (Touch-friendly 44px targets) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t border-slate-100 dark:border-slate-800/80 md:border-t-0">
          <button
            type="button"
            onClick={handleCopyQuote}
            className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 touch-manipulation ${
              hasCopied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Copy quote to clipboard"
            aria-label="Copy quote"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextQuote}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation"
            title="Shuffle to another inspirational quote"
            aria-label="Next Quote"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isRotating ? 'rotate-180' : ''}`} />
            <span className="text-[11px]">New Quote</span>
          </button>
        </div>
      </div>
    </section>
  );
};
