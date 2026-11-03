import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Award,
  Zap,
  BarChart3,
  Layers,
  ArrowRight,
  Check,
  X,
  FileText,
  ZoomIn,
  ZoomOut,
  History,
} from 'lucide-react';
import { Question, SubjectName, ExamTarget, MockTestAttempt } from '../types';
import { AVAILABLE_CHAPTERS } from '../data/initialData';
import { saveMockTestResult } from '../lib/firebase';

interface MockTestPortalProps {
  questions: Question[];
  studentName: string;
  defaultExamTarget: ExamTarget;
  preselectedChapter?: { subject: string; chapter: string } | null;
  onClearPreselectedChapter?: () => void;
  reattemptData?: MockTestAttempt | null;
  onClearReattempt?: () => void;
  onViewHistory?: () => void;
}

type PaletteStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_and_marked';

export const MockTestPortal: React.FC<MockTestPortalProps> = ({
  questions,
  studentName,
  defaultExamTarget,
  preselectedChapter,
  onClearPreselectedChapter,
  reattemptData,
  onClearReattempt,
  onViewHistory,
}) => {
  // Test generator state
  const [examTarget, setExamTarget] = useState<ExamTarget>(defaultExamTarget || 'JEE Main');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectName[]>(
    defaultExamTarget === 'NEET' ? ['Physics', 'Chemistry', 'Biology'] : ['Physics', 'Chemistry', 'Mathematics']
  );
  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    preselectedChapter ? [preselectedChapter.chapter] : []
  );
  const [totalQuestionsRequested, setTotalQuestionsRequested] = useState<number>(20);

  // Lightbox Zoom State for large diagrams & options
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);

  // CBT Mode states
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [testTotalTimeSeconds, setTestTotalTimeSeconds] = useState(0);

  // Student Responses
  // answers: { [questionId]: { selectedOptionIds?: string[]; numericalInput?: string } }
  const [userAnswers, setUserAnswers] = useState<Record<string, { selectedOptionIds?: string[]; numericalInput?: string }>>({});
  // questionStatuses: { [questionId]: PaletteStatus }
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, PaletteStatus>>({});

  // Fullscreen container ref
  const testContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Latest completed test result
  const [testResult, setTestResult] = useState<MockTestAttempt | null>(null);

  // Update selected subjects if exam target changes
  useEffect(() => {
    if (examTarget === 'NEET') {
      setSelectedSubjects(['Physics', 'Chemistry', 'Biology']);
    } else {
      setSelectedSubjects(['Physics', 'Chemistry', 'Mathematics']);
    }
  }, [examTarget]);

  // Handle preselected chapter from search
  useEffect(() => {
    if (preselectedChapter) {
      if (!selectedChapters.includes(preselectedChapter.chapter)) {
        setSelectedChapters((prev) => [...prev, preselectedChapter.chapter]);
      }
      if (!selectedSubjects.includes(preselectedChapter.subject as SubjectName)) {
        setSelectedSubjects((prev) => [...prev, preselectedChapter.subject as SubjectName]);
      }
    }
  }, [preselectedChapter]);

  // Handle re-attempt test request from Test History
  useEffect(() => {
    if (reattemptData) {
      if (reattemptData.examTarget) setExamTarget(reattemptData.examTarget);
      if (reattemptData.selectedSubjects?.length) setSelectedSubjects(reattemptData.selectedSubjects);
      if (reattemptData.selectedChapters?.length) setSelectedChapters(reattemptData.selectedChapters);
      if (reattemptData.totalQuestions) setTotalQuestionsRequested(reattemptData.totalQuestions);
      if (onClearReattempt) onClearReattempt();
    }
  }, [reattemptData, onClearReattempt]);

  // Intelligent Question Count Minimum Constraints:
  // - 10 chapters selected -> minimum 10 questions
  // - 20 chapters selected -> minimum 20 questions
  // - >=75 chapters selected -> minimum 75 questions
  const minQuestionConstraint = useMemo(() => {
    const count = selectedChapters.length;
    if (count >= 75) return 75;
    if (count >= 20) return Math.max(20, count);
    if (count >= 10) return Math.max(10, count);
    return Math.max(5, count);
  }, [selectedChapters]);

  // Ensure total questions requested satisfies minimum constraint
  useEffect(() => {
    if (totalQuestionsRequested < minQuestionConstraint) {
      setTotalQuestionsRequested(minQuestionConstraint);
    }
  }, [minQuestionConstraint, totalQuestionsRequested]);

  // Available chapters for the selected subjects
  const availableChaptersList = useMemo(() => {
    const list: { subject: SubjectName; chapter: string }[] = [];
    selectedSubjects.forEach((sub) => {
      (AVAILABLE_CHAPTERS[sub] || []).forEach((ch) => {
        list.push({ subject: sub, chapter: ch });
      });
    });
    return list;
  }, [selectedSubjects]);

  const toggleSelectAllChapters = () => {
    if (selectedChapters.length === availableChaptersList.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(availableChaptersList.map((c) => c.chapter));
    }
  };

  const toggleChapter = (chapter: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapter) ? prev.filter((c) => c !== chapter) : [...prev, chapter]
    );
  };

  // Timer countdown
  useEffect(() => {
    if (!isTestActive || isTestSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestActive, isTestSubmitted]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      testContainerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ==================== BALANCING ALGORITHM ====================
  // Exactly 20% Numerical Value Type (NAT), 80% MCQs.
  // Subject order strictly: Physics -> Chemistry -> Mathematics (JEE) or Physics -> Chemistry -> Biology (NEET).
  const handleStartTest = () => {
    const count = totalQuestionsRequested;
    const natCount = Math.round(count * 0.2); // 20% NAT
    const mcqCount = count - natCount; // 80% MCQ

    // Filter candidate questions from question bank matching subjects & chapters if selected
    let pool = questions.filter((q) => selectedSubjects.includes(q.subject));
    if (selectedChapters.length > 0) {
      const chapterPool = pool.filter((q) => selectedChapters.includes(q.chapter));
      if (chapterPool.length >= count / 2) {
        pool = chapterPool;
      }
    }

    const mcqPool = pool.filter((q) => q.type === 'single_choice' || q.type === 'multi_choice');
    const natPool = pool.filter((q) => q.type === 'numerical');

    // Helper to select with duplication/synthesis fallback if pool has fewer items
    const pickItems = (source: Question[], needed: number, fallbackType: 'single_choice' | 'numerical'): Question[] => {
      const selected: Question[] = [];
      let idx = 0;
      while (selected.length < needed) {
        if (source.length > 0) {
          const item = source[idx % source.length];
          selected.push({
            ...item,
            id: `${item.id}-${selected.length + 1}`,
          });
        } else {
          // Fallback synthesizer
          const sub = selectedSubjects[selected.length % selectedSubjects.length];
          selected.push({
            id: `synth-${Date.now()}-${selected.length + 1}`,
            targetExam: examTarget,
            classLevel: 'Class 12',
            subject: sub,
            chapter: selectedChapters[0] || 'High Yield Section',
            type: fallbackType,
            difficulty: 'medium',
            text:
              fallbackType === 'numerical'
                ? `[Numerical Problem] Calculate the magnitude of vector or thermodynamic quantity in SI units for this high-yield ${sub} concept.`
                : `[NTA Standard Question] Which of the following fundamental principles applies to this high-yield ${sub} problem?`,
            options:
              fallbackType === 'numerical'
                ? []
                : [
                    { id: 'opt-1', text: 'Option A (Standard Condition)', isCorrect: true },
                    { id: 'opt-2', text: 'Option B (Deviated Case)', isCorrect: false },
                    { id: 'opt-3', text: 'Option C (High Pressure Limit)', isCorrect: false },
                    { id: 'opt-4', text: 'Option D (Inverted Phase)', isCorrect: false },
                  ],
            numericalAnswer: fallbackType === 'numerical' ? 10 : undefined,
            explanationText: 'Standard step-by-step derivation according to NTA syllabus.',
            createdAt: new Date().toISOString(),
          });
        }
        idx++;
      }
      return selected;
    };

    const chosenMCQs = pickItems(mcqPool, mcqCount, 'single_choice');
    const chosenNATs = pickItems(natPool, natCount, 'numerical');

    const combined = [...chosenMCQs, ...chosenNATs];

    // Subject Ordering: Strictly Physics -> Chemistry -> Mathematics (JEE) or Physics -> Chemistry -> Biology (NEET)
    const subjectOrder: SubjectName[] =
      examTarget === 'NEET'
        ? ['Physics', 'Chemistry', 'Biology']
        : ['Physics', 'Chemistry', 'Mathematics'];

    combined.sort((a, b) => {
      const idxA = subjectOrder.indexOf(a.subject);
      const idxB = subjectOrder.indexOf(b.subject);
      if (idxA !== idxB) return idxA - idxB;
      // Secondary sort: MCQs first, then NAT
      if (a.type === 'numerical' && b.type !== 'numerical') return 1;
      if (a.type !== 'numerical' && b.type === 'numerical') return -1;
      return 0;
    });

    const initialStatuses: Record<string, PaletteStatus> = {};
    combined.forEach((q, i) => {
      initialStatuses[q.id] = i === 0 ? 'not_answered' : 'not_visited';
    });

    // 1.5 minutes per question for standard NTA pacing
    const totalSeconds = count * 90;

    setTestQuestions(combined);
    setQuestionStatuses(initialStatuses);
    setUserAnswers({});
    setActiveQuestionIndex(0);
    setTestTotalTimeSeconds(totalSeconds);
    setTimeRemainingSeconds(totalSeconds);
    setIsTestActive(true);
    setIsTestSubmitted(false);
    setTestResult(null);
  };

  // ==================== CBT ACTIONS ====================

  const currentQuestion = testQuestions[activeQuestionIndex];

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    if (currentQuestion.type === 'multi_choice') {
      const currentSelected = userAnswers[qId]?.selectedOptionIds || [];
      const updated = currentSelected.includes(optionId)
        ? currentSelected.filter((id) => id !== optionId)
        : [...currentSelected, optionId];
      setUserAnswers((prev) => ({
        ...prev,
        [qId]: { ...prev[qId], selectedOptionIds: updated },
      }));
    } else {
      setUserAnswers((prev) => ({
        ...prev,
        [qId]: { ...prev[qId], selectedOptionIds: [optionId] },
      }));
    }
  };

  const handleNumericalChange = (val: string) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], numericalInput: val },
    }));
  };

  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const ans = userAnswers[qId];
    const hasAnswer =
      (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
      (ans?.numericalInput && ans.numericalInput.trim() !== '');

    setQuestionStatuses((prev) => ({
      ...prev,
      [qId]: hasAnswer ? 'answered' : 'not_answered',
    }));

    if (activeQuestionIndex < testQuestions.length - 1) {
      const nextIdx = activeQuestionIndex + 1;
      setActiveQuestionIndex(nextIdx);
      const nextQId = testQuestions[nextIdx].id;
      if (questionStatuses[nextQId] === 'not_visited') {
        setQuestionStatuses((prev) => ({ ...prev, [nextQId]: 'not_answered' }));
      }
    }
  };

  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const ans = userAnswers[qId];
    const hasAnswer =
      (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
      (ans?.numericalInput && ans.numericalInput.trim() !== '');

    setQuestionStatuses((prev) => ({
      ...prev,
      [qId]: hasAnswer ? 'answered_and_marked' : 'marked_for_review',
    }));

    if (activeQuestionIndex < testQuestions.length - 1) {
      const nextIdx = activeQuestionIndex + 1;
      setActiveQuestionIndex(nextIdx);
      const nextQId = testQuestions[nextIdx].id;
      if (questionStatuses[nextQId] === 'not_visited') {
        setQuestionStatuses((prev) => ({ ...prev, [nextQId]: 'not_answered' }));
      }
    }
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    setQuestionStatuses((prev) => ({
      ...prev,
      [qId]: 'not_answered',
    }));
  };

  const jumpToQuestion = (index: number) => {
    if (index < 0 || index >= testQuestions.length) return;
    // Update current question status if it wasn't answered
    const currentQId = testQuestions[activeQuestionIndex]?.id;
    if (currentQId && questionStatuses[currentQId] === 'not_visited') {
      setQuestionStatuses((prev) => ({ ...prev, [currentQId]: 'not_answered' }));
    }

    setActiveQuestionIndex(index);
    const targetQId = testQuestions[index].id;
    if (questionStatuses[targetQId] === 'not_visited') {
      setQuestionStatuses((prev) => ({ ...prev, [targetQId]: 'not_answered' }));
    }
  };

  // ==================== SUBMISSION & SCORING ====================
  // JEE / NEET Marking: +4 for Correct, -1 for Incorrect, 0 for Unattempted.

  const handleSubmitTest = async () => {
    setShowSubmitModal(false);
    setIsTestActive(false);
    setIsTestSubmitted(true);

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const evaluatedAnswers: Record<string, any> = {};

    testQuestions.forEach((q) => {
      const ans = userAnswers[q.id];
      const hasAnswer =
        (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
        (ans?.numericalInput && ans.numericalInput.trim() !== '');

      if (!hasAnswer) {
        unattemptedCount++;
        evaluatedAnswers[q.id] = { ...ans, isCorrect: false, marks: 0, status: 'unattempted' };
      } else {
        let isCorrect = false;

        if (q.type === 'numerical') {
          const userNum = parseFloat(ans.numericalInput || '0');
          const correctNum = q.numericalAnswer ?? 0;
          const tol = q.numericalTolerance ?? 0.05;
          isCorrect = Math.abs(userNum - correctNum) <= tol;
        } else if (q.type === 'multi_choice') {
          const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
          const userIds = (ans.selectedOptionIds || []).sort();
          isCorrect = JSON.stringify(correctIds) === JSON.stringify(userIds);
        } else {
          // single choice
          const correctOpt = q.options.find((o) => o.isCorrect);
          isCorrect = ans.selectedOptionIds?.[0] === correctOpt?.id;
        }

        if (isCorrect) {
          correctCount++;
          score += 4;
          evaluatedAnswers[q.id] = { ...ans, isCorrect: true, marks: 4, status: 'correct' };
        } else {
          incorrectCount++;
          score -= 1;
          evaluatedAnswers[q.id] = { ...ans, isCorrect: false, marks: -1, status: 'incorrect' };
        }
      }
    });

    const maxScore = testQuestions.length * 4;
    const accuracy =
      correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;

    const timeSpent = testTotalTimeSeconds - timeRemainingSeconds;

    const attempt: MockTestAttempt = {
      id: 'mock-' + Date.now(),
      studentName: studentName || 'Aspirant',
      examTarget,
      selectedSubjects,
      selectedChapters,
      totalQuestions: testQuestions.length,
      score,
      maxScore,
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy,
      timeTakenSeconds: timeSpent,
      answers: evaluatedAnswers,
      submittedAt: new Date().toISOString(),
    };

    setTestResult(attempt);
    await saveMockTestResult(attempt);

    // Confetti celebration if score is positive
    if (score > 0) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  // Palette counts
  const paletteStats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let markedAndAnswered = 0;
    let notVisited = 0;

    testQuestions.forEach((q) => {
      const st = questionStatuses[q.id] || 'not_visited';
      if (st === 'answered') answered++;
      else if (st === 'not_answered') notAnswered++;
      else if (st === 'marked_for_review') marked++;
      else if (st === 'answered_and_marked') markedAndAnswered++;
      else notVisited++;
    });

    return { answered, notAnswered, marked, markedAndAnswered, notVisited };
  }, [testQuestions, questionStatuses]);

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==================== RENDER: GENERATOR SCREEN ====================
  if (!isTestActive && !isTestSubmitted) {
    return (
      <div className="space-y-6">
        {/* Generator Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" /> NTA-Standard CBT Mock Test Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Your Custom Balanced Mock Test
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Auto-balanced with <span className="text-indigo-400 font-bold">80% MCQs</span> and{' '}
              <span className="text-amber-400 font-bold">20% Numerical Value Questions (NAT)</span> in strict
              NTA order with official +4 / -1 marking scheme.
            </p>
          </div>

          {onViewHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-lg relative z-10 active:scale-95"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Score Progression & History</span>
            </button>
          )}
        </div>

        {/* Test Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Setup Options */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Target Exam */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Target Exam
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['JEE Main', 'JEE Advanced', 'NEET', 'Class 12'] as ExamTarget[]).map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => setExamTarget(exam)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition text-center ${
                      examTarget === exam
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Subjects Selector */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Subjects to Include (Strict Sequence: Physics → Chem → Math/Bio)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Physics', 'Chemistry', 'Mathematics', 'Biology'] as SubjectName[]).map((sub) => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        if (isChecked && selectedSubjects.length > 1) {
                          setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
                        } else if (!isChecked) {
                          setSelectedSubjects([...selectedSubjects, sub]);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{sub}</span>
                      {isChecked && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Chapters Multi-Select with Minimum Constraints */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Chapter Selection ({selectedChapters.length} Selected)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Rule: ≥10 ch = min 10 ques | ≥20 ch = min 20 ques | ≥75 ch = min 75 ques
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAllChapters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  {selectedChapters.length === availableChaptersList.length ? 'Deselect All' : 'Select Full Syllabus'}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {availableChaptersList.map((c) => {
                  const isSel = selectedChapters.includes(c.chapter);
                  return (
                    <div
                      key={c.chapter}
                      onClick={() => toggleChapter(c.chapter)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSel
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                          {c.subject}
                        </span>
                        <span className="font-medium">{c.chapter}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSel ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'
                        }`}
                      >
                        {isSel && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Question Count & Launch Summary */}
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Total Questions Count
              </label>

              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-3xl font-black text-white">{totalQuestionsRequested}</span>
                  <span className="text-xs text-slate-400 block">Questions</span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Min required: {minQuestionConstraint}</p>
                  <p>Est. Time: {Math.round((totalQuestionsRequested * 90) / 60)} Mins</p>
                </div>
              </div>

              <input
                type="range"
                min={minQuestionConstraint}
                max={90}
                step={5}
                value={totalQuestionsRequested}
                onChange={(e) => setTotalQuestionsRequested(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              {/* Composition Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Single/Multi Choice MCQs (80%):</span>
                  <span className="font-bold text-indigo-400">
                    {totalQuestionsRequested - Math.round(totalQuestionsRequested * 0.2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Numerical Value Type (NAT 20%):</span>
                  <span className="font-bold text-amber-400">
                    {Math.round(totalQuestionsRequested * 0.2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-white">
                  <span>Total Marks Possible:</span>
                  <span className="text-emerald-400">+{totalQuestionsRequested * 4}</span>
                </div>
              </div>

              {/* Launch Button */}
              <button
                type="button"
                onClick={handleStartTest}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Start NTA CBT Mock Test
              </button>
            </div>

            {/* Marking Scheme Info Card */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" /> NTA Examination Rules
              </p>
              <ul className="text-slate-300 space-y-1 list-disc list-inside">
                <li><span className="text-emerald-400 font-bold">+4</span> for correct answers</li>
                <li><span className="text-rose-400 font-bold">-1</span> for incorrect answers</li>
                <li><span className="text-slate-400 font-bold">0</span> for unattempted questions</li>
                <li>Color-coded NTA question palette with real-time timers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER: CBT ENGINE INTERFACE ====================
  if (isTestActive && currentQuestion) {
    const qAns = userAnswers[currentQuestion.id];
    const isAnswered =
      (qAns?.selectedOptionIds && qAns.selectedOptionIds.length > 0) ||
      (qAns?.numericalInput && qAns.numericalInput.trim() !== '');

    return (
      <div
        ref={testContainerRef}
        className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden"
      >
        {/* NTA Top Bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-black text-indigo-400 text-base sm:text-lg tracking-wider">PREPSKM</span>
            <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
              {examTarget} CBT Online
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              Candidate: <span className="text-white font-semibold">{studentName}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base ${
                timeRemainingSeconds < 300
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-indigo-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition"
            >
              Submit Exam
            </button>
          </div>
        </header>

        {/* NTA Exam Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Question Display Area */}
          <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800">
            {/* Question Header & Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-black text-xs">
                  Q {activeQuestionIndex + 1} of {testQuestions.length}
                </span>
                <span className="text-xs font-bold text-indigo-400">{currentQuestion.subject}</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 truncate max-w-xs">{currentQuestion.chapter}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentQuestion.type === 'numerical' ? 'Numerical (NAT)' : 'MCQ (+4, -1)'}
                </span>
              </div>
            </div>

            {/* Question Text & Diagram */}
            <div className="flex-1 py-4 space-y-4">
              <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                {currentQuestion.text}
              </div>

              {/* Cropped Question Image if provided - Large, crystal clear & zoomable */}
              {currentQuestion.imageBase64 && (
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border-2 border-indigo-500/30 max-w-4xl shadow-xl group">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5" /> High-Resolution Question Diagram (Click to Expand)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomedImage({
                          src: currentQuestion.imageBase64!,
                          title: `Question ${activeQuestionIndex + 1} Diagram`,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 font-semibold text-xs transition"
                    >
                      Enlarge / Inspect
                    </button>
                  </div>
                  <div
                    onClick={() =>
                      setZoomedImage({
                        src: currentQuestion.imageBase64!,
                        title: `Question ${activeQuestionIndex + 1} Diagram`,
                      })
                    }
                    className="cursor-zoom-in overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-3"
                  >
                    <img
                      src={currentQuestion.imageBase64}
                      alt="Question Diagram"
                      className="max-h-80 sm:max-h-96 md:max-h-[460px] w-auto max-w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </div>
                </div>
              )}

              {/* Question Options or Numerical Input */}
              <div className="pt-2">
                {currentQuestion.type === 'numerical' ? (
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-md space-y-3">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Numerical Value Input (NAT):
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={qAns?.numericalInput || ''}
                      onChange={(e) => handleNumericalChange(e.target.value)}
                      placeholder="Enter integer or decimal value"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500">
                      Standard NTA NAT: No negative marking if specified, round off to nearest decimal if needed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-3xl">
                    {currentQuestion.options.map((opt, oIdx) => {
                      const isSelected = qAns?.selectedOptionIds?.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col gap-3 ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-xl border text-xs font-black flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-slate-700 text-slate-400 bg-slate-950'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="font-semibold text-sm sm:text-base">{opt.text}</span>
                            </div>
                            {opt.imageBase64 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedImage({
                                    src: opt.imageBase64!,
                                    title: `Option ${String.fromCharCode(65 + oIdx)} Diagram`,
                                  });
                                }}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-1 shrink-0"
                              >
                                <ZoomIn className="w-3 h-3" /> Zoom
                              </button>
                            )}
                          </div>

                          {/* Large, High-Legibility Option Diagram */}
                          {opt.imageBase64 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage({
                                  src: opt.imageBase64!,
                                  title: `Option ${String.fromCharCode(65 + oIdx)} Diagram`,
                                });
                              }}
                              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center overflow-hidden cursor-zoom-in hover:border-indigo-500/40 transition"
                            >
                              <img
                                src={opt.imageBase64}
                                alt={`Option ${String.fromCharCode(65 + oIdx)}`}
                                className="max-h-40 sm:max-h-56 md:max-h-64 w-auto max-w-full rounded-lg object-contain"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearResponse}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Clear Response
                </button>
                <button
                  type="button"
                  onClick={handleMarkForReviewAndNext}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Mark for Review & Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeQuestionIndex === 0}
                  onClick={() => jumpToQuestion(activeQuestionIndex - 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>

          {/* Right NTA Question Palette */}
          <aside className="w-full md:w-80 bg-slate-900/70 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Question Palette
              </h4>

              {/* Official NTA Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {paletteStats.answered}
                  </div>
                  <span className="text-slate-300">Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {paletteStats.notAnswered}
                  </div>
                  <span className="text-slate-300">Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {paletteStats.marked}
                  </div>
                  <span className="text-slate-300">Marked Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    {paletteStats.notVisited}
                  </div>
                  <span className="text-slate-300">Not Visited</span>
                </div>
              </div>

              {/* Numbered Palette Matrix */}
              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                {testQuestions.map((q, idx) => {
                  const st = questionStatuses[q.id] || 'not_visited';
                  const isCurrent = idx === activeQuestionIndex;

                  let bgClass = 'bg-slate-800 text-slate-400 border-slate-700'; // not visited
                  if (st === 'answered') bgClass = 'bg-emerald-600 text-white border-emerald-500';
                  else if (st === 'not_answered') bgClass = 'bg-rose-600 text-white border-rose-500';
                  else if (st === 'marked_for_review') bgClass = 'bg-purple-600 text-white border-purple-500';
                  else if (st === 'answered_and_marked')
                    bgClass = 'bg-purple-600 text-white border-emerald-400 ring-2 ring-emerald-400/60';

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(idx)}
                      className={`h-9 rounded-lg text-xs font-bold border transition relative flex items-center justify-center ${bgClass} ${
                        isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition"
              >
                Submit Test Analysis
              </button>
            </div>
          </aside>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Confirm Test Submission</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to end this mock test? Your score and solutions will be computed immediately.
              </p>

              {/* Summary table */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-white">{testQuestions.length}</span>
                <span className="text-slate-400">Answered:</span>
                <span className="font-bold text-emerald-400">{paletteStats.answered}</span>
                <span className="text-slate-400">Not Answered:</span>
                <span className="font-bold text-rose-400">{paletteStats.notAnswered}</span>
                <span className="text-slate-400">Marked for Review:</span>
                <span className="font-bold text-purple-400">{paletteStats.marked}</span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Resume Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
                >
                  Yes, Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== RENDER: SCORECARD & SOLUTION KEY ====================
  if (isTestSubmitted && testResult) {
    const percent = Math.round((testResult.score / testResult.maxScore) * 100);

    return (
      <div className="space-y-6">
        {/* Scorecard Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                Test Completed & Synced to Firestore
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {testResult.examTarget} Scorecard
              </h2>
              <p className="text-xs text-slate-400">
                Attempted on {new Date(testResult.submittedAt).toLocaleDateString()} by {testResult.studentName}
              </p>
            </div>

            {/* Score Pill */}
            <div className="text-center bg-slate-950/80 px-6 py-4 rounded-2xl border border-slate-800">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
                {testResult.score}
              </span>
              <span className="text-sm text-slate-400 block font-semibold">
                / {testResult.maxScore} Marks ({percent}%)
              </span>
            </div>
          </div>

          {/* Stats Breakdown Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-xl font-bold text-indigo-400">{testResult.accuracy}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Correct (+4)</span>
              <span className="text-xl font-bold text-emerald-400">{testResult.correctCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Incorrect (-1)</span>
              <span className="text-xl font-bold text-rose-400">{testResult.incorrectCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Time Taken</span>
              <span className="text-xl font-bold text-slate-200">
                {Math.round(testResult.timeTakenSeconds / 60)} Mins
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setIsTestSubmitted(false);
                setIsTestActive(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Create New Mock Test
            </button>
          </div>
        </div>

        {/* Detailed Question-by-Question Solution Key */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Comprehensive Solution Key & Explanations
          </h3>

          <div className="space-y-4">
            {testQuestions.map((q, idx) => {
              const res = testResult.answers[q.id];
              const isCorrect = res?.isCorrect;
              const isUnattempted = res?.status === 'unattempted';

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition ${
                    isCorrect
                      ? 'bg-slate-900 border-emerald-500/30'
                      : isUnattempted
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-900 border-rose-500/30'
                  }`}
                >
                  {/* Question Title & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-800 text-white">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-indigo-400">{q.subject}</span>
                      <span className="text-xs text-slate-400">• {q.chapter}</span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isUnattempted
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isCorrect ? '+4 Correct' : isUnattempted ? '0 Unattempted' : '-1 Incorrect'}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="py-3 text-sm text-slate-200 whitespace-pre-wrap">{q.text}</div>

                  {q.imageBase64 && (
                    <div
                      onClick={() =>
                        setZoomedImage({
                          src: q.imageBase64!,
                          title: `Question ${idx + 1} Diagram`,
                        })
                      }
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-zoom-in inline-block max-w-full mb-3 hover:border-indigo-500/40 transition"
                    >
                      <img
                        src={q.imageBase64}
                        alt="Question Diagram"
                        className="max-h-72 sm:max-h-80 md:max-h-96 w-auto max-w-full rounded-lg object-contain"
                      />
                      <span className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1 font-semibold">
                        <ZoomIn className="w-3 h-3" /> Click to enlarge diagram
                      </span>
                    </div>
                  )}

                  {/* Options status */}
                  {q.type !== 'numerical' && (
                    <div className="space-y-2 mb-3 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const userPicked = res?.selectedOptionIds?.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border flex flex-col gap-2 ${
                              opt.isCorrect
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                                : userPicked
                                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-[10px]">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                              {opt.isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Correct Answer
                                </span>
                              )}
                              {userPicked && !opt.isCorrect && (
                                <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                                  <X className="w-3 h-3" /> Your Response
                                </span>
                              )}
                            </div>

                            {/* Option Diagram if present */}
                            {opt.imageBase64 && (
                              <div
                                onClick={() =>
                                  setZoomedImage({
                                    src: opt.imageBase64!,
                                    title: `Option ${String.fromCharCode(65 + oIdx)} Diagram`,
                                  })
                                }
                                className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 cursor-zoom-in flex items-center justify-center"
                              >
                                <img
                                  src={opt.imageBase64}
                                  alt={`Option ${String.fromCharCode(65 + oIdx)}`}
                                  className="max-h-36 sm:max-h-48 w-auto max-w-full rounded object-contain"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Numerical Answer Info */}
                  {q.type === 'numerical' && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-3 space-y-1">
                      <p className="text-slate-300">
                        Correct Numerical Value: <span className="font-bold text-emerald-400">{q.numericalAnswer}</span>
                      </p>
                      <p className="text-slate-400">
                        Your Input: <span className="font-bold text-white">{res?.numericalInput || 'None'}</span>
                      </p>
                    </div>
                  )}

                  {/* Explanation Box */}
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                    <p className="text-xs font-bold text-indigo-300">Step-by-Step Explanation:</p>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {q.explanationText}
                    </p>
                    {q.explanationImageBase64 && (
                      <div
                        onClick={() =>
                          setZoomedImage({
                            src: q.explanationImageBase64!,
                            title: `Question ${idx + 1} Solution Explanation`,
                          })
                        }
                        className="pt-2 cursor-zoom-in"
                      >
                        <img
                          src={q.explanationImageBase64}
                          alt="Explanation Solution"
                          className="max-h-72 sm:max-h-80 md:max-h-96 rounded-xl border border-indigo-500/30 object-contain bg-slate-950 p-2"
                        />
                        <span className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1 font-semibold">
                          <ZoomIn className="w-3 h-3" /> Click to enlarge explanation
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Lightbox Zoom Modal for Diagrams and Options */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in"
            onClick={() => setZoomedImage(null)}
          >
            <div
              className="relative max-w-5xl max-h-[92vh] w-full flex flex-col bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-white flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-indigo-400" />
                  {zoomedImage.title}
                </span>
                <button
                  type="button"
                  onClick={() => setZoomedImage(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-bold px-2.5"
                >
                  ✕ Close (Esc)
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/90">
                <img
                  src={zoomedImage.src}
                  alt={zoomedImage.title}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-transform"
                />
              </div>

              <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                Pinch or zoom on mobile • Click outside or Close button to dismiss
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Global Lightbox Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold text-white flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-indigo-400" />
                {zoomedImage.title}
              </span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-bold px-2.5"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/90">
              <img
                src={zoomedImage.src}
                alt={zoomedImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
