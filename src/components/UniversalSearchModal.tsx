import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, BookOpen, FileText, Video, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Question, StudyMaterial } from '../types';
import { AVAILABLE_CHAPTERS } from '../data/initialData';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: StudyMaterial[];
  questions: Question[];
  onSelectChapter: (subject: string, chapter: string) => void;
  onSelectMaterial: (material: StudyMaterial) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  materials,
  questions,
  onSelectChapter,
  onSelectMaterial,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return { chapters: [], materials: [], questions: [] };
    }
    const q = query.toLowerCase().trim();

    // Search chapters
    const matchedChapters: { subject: string; chapter: string }[] = [];
    Object.entries(AVAILABLE_CHAPTERS).forEach(([subject, chapters]) => {
      chapters.forEach((ch) => {
        if (ch.toLowerCase().includes(q) || subject.toLowerCase().includes(q)) {
          matchedChapters.push({ subject, chapter: ch });
        }
      });
    });

    // Search materials (notes, PYQs, formula sheets, videos)
    const matchedMaterials = materials.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );

    // Search questions
    const matchedQuestions = questions.filter(
      (ques) =>
        ques.text.toLowerCase().includes(q) ||
        ques.chapter.toLowerCase().includes(q) ||
        ques.subject.toLowerCase().includes(q)
    );

    return {
      chapters: matchedChapters.slice(0, 6),
      materials: matchedMaterials.slice(0, 6),
      questions: matchedQuestions.slice(0, 5),
    };
  }, [query, materials, questions]);

  if (!isOpen) return null;

  const totalResults =
    searchResults.chapters.length + searchResults.materials.length + searchResults.questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters, formula sheets, notes, PYQs, videos... (Press Esc to exit)"
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!query.trim() ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Instant Universal Search</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for "Kinematics", "Organic Chemistry", "Calculus formulas", or "PYQ".
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['Kinematics', 'Thermodynamics', 'Organic Reactions', 'Genetics', 'Calculus'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 text-xs rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">No matches found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or chapter name.</p>
            </div>
          ) : (
            <>
              {/* Chapters section */}
              {searchResults.chapters.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Syllabus Chapters ({searchResults.chapters.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectChapter(ch.subject, ch.chapter);
                          onClose();
                        }}
                        className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/50 hover:border-indigo-500/40 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {ch.subject}
                          </span>
                          <span className="text-sm text-white font-medium group-hover:text-indigo-300 transition">
                            {ch.chapter}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-indigo-400">
                          Practice Mock <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Materials */}
              {searchResults.materials.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> Study Materials & Lectures ({searchResults.materials.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.materials.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => {
                          onSelectMaterial(mat);
                          onClose();
                        }}
                        className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/50 hover:border-cyan-500/40 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                            {mat.category === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition line-clamp-1">
                              {mat.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {mat.subject} • <span className="capitalize">{mat.category.replace('_', ' ')}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-cyan-400 flex items-center gap-1">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Bank Results */}
              {searchResults.questions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400" /> Question Bank Items ({searchResults.questions.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.questions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                            {q.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400">{q.subject} • {q.chapter}</span>
                        </div>
                        <p className="text-xs text-slate-200 line-clamp-2">{q.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
