import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  RotateCcw,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BarChart2,
  ChevronRight,
  Target,
  FileCheck2,
  ExternalLink,
  Zap,
  Filter,
} from 'lucide-react';
import { MockTestAttempt, ExamTarget } from '../types';
import { getMockTestResults } from '../lib/firebase';

interface TestHistoryProps {
  studentName: string;
  targetExam: ExamTarget;
  onReattemptTest?: (attempt: MockTestAttempt) => void;
  onStartNewTest?: () => void;
}

// Helper to calculate performance complement based on score percentage
export function getPerformanceComplement(percentage: number): {
  headline: string;
  badge: string;
  color: string;
  message: string;
} {
  if (percentage >= 90) {
    return {
      headline: 'AIR Top 100 Caliber! Outstanding Mastery 🏆',
      badge: 'Exceptional (AIR < 500)',
      color: 'from-amber-400 to-yellow-500 text-amber-950',
      message:
        'Brilliant conceptual clarity and speed! Maintain this precision. Keep revising formula flashcards and minimize silly calculation errors in mock re-attempts.',
    };
  } else if (percentage >= 75) {
    return {
      headline: 'Excellent Performance! Top 1% Percentile Trajectory 🚀',
      badge: 'High Distinction',
      color: 'from-emerald-400 to-teal-500 text-emerald-950',
      message:
        'You have crossed the crucial benchmark! Focus on high-yield NAT questions and optimize time management to push this past the 90% threshold.',
    };
  } else if (percentage >= 50) {
    return {
      headline: 'Good Solid Foundation! Eliminate Negative Marks ⚡',
      badge: 'Competitive Tier',
      color: 'from-indigo-400 to-blue-500 text-indigo-950',
      message:
        'Good grasp of fundamentals. Analyze your incorrect responses in the solution key — unforced negative markings (-1) cost you valuable ranks!',
    };
  } else {
    return {
      headline: 'Reality Check Required! Revise Backlogs Immediately ⚠️',
      badge: 'Needs Revision',
      color: 'from-rose-400 to-orange-500 text-rose-950',
      message:
        'No excuses. Put your phone on airplane mode, revise chapter handwritten notes in the Materials Hub, and solve PYQs before attempting again.',
    };
  }
}

export const TestHistory: React.FC<TestHistoryProps> = ({
  studentName,
  targetExam,
  onReattemptTest,
  onStartNewTest,
}) => {
  const [historyList, setHistoryList] = useState<MockTestAttempt[]>([]);
  const [selectedAttemptForMarksheet, setSelectedAttemptForMarksheet] = useState<MockTestAttempt | null>(null);
  const [chartMetric, setChartMetric] = useState<'score' | 'accuracy'>('score');
  const marksheetRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load test history from Firebase/localStorage
  useEffect(() => {
    const loadHistory = async () => {
      const results = await getMockTestResults();
      if (results && results.length > 0) {
        setHistoryList(results);
      } else {
        // Pre-populate realistic seed progression if student is new
        const seedAttempts: MockTestAttempt[] = [
          {
            id: 'mock-hist-1',
            studentName: studentName || 'Aspirant',
            examTarget: targetExam,
            selectedSubjects: ['Physics', 'Chemistry', 'Mathematics'],
            selectedChapters: ['Kinematics', 'Atomic Structure', 'Matrices'],
            totalQuestions: 20,
            score: 44,
            maxScore: 80,
            correctCount: 12,
            incorrectCount: 4,
            unattemptedCount: 4,
            accuracy: 75,
            timeTakenSeconds: 1540,
            submittedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
            answers: {},
          },
          {
            id: 'mock-hist-2',
            studentName: studentName || 'Aspirant',
            examTarget: targetExam,
            selectedSubjects: ['Physics', 'Chemistry', 'Mathematics'],
            selectedChapters: ['Work Energy Power', 'Chemical Bonding'],
            totalQuestions: 20,
            score: 52,
            maxScore: 80,
            correctCount: 14,
            incorrectCount: 4,
            unattemptedCount: 2,
            accuracy: 78,
            timeTakenSeconds: 1620,
            submittedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            answers: {},
          },
          {
            id: 'mock-hist-3',
            studentName: studentName || 'Aspirant',
            examTarget: targetExam,
            selectedSubjects: ['Physics', 'Chemistry', 'Mathematics'],
            selectedChapters: ['Rotational Dynamics', 'Thermodynamics'],
            totalQuestions: 25,
            score: 68,
            maxScore: 100,
            correctCount: 18,
            incorrectCount: 4,
            unattemptedCount: 3,
            accuracy: 82,
            timeTakenSeconds: 2100,
            submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            answers: {},
          },
          {
            id: 'mock-hist-4',
            studentName: studentName || 'Aspirant',
            examTarget: targetExam,
            selectedSubjects: ['Physics', 'Chemistry', 'Mathematics'],
            selectedChapters: ['Electrostatics', 'Equilibrium', 'Definite Integrals'],
            totalQuestions: 25,
            score: 76,
            maxScore: 100,
            correctCount: 20,
            incorrectCount: 4,
            unattemptedCount: 1,
            accuracy: 83,
            timeTakenSeconds: 2050,
            submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            answers: {},
          },
          {
            id: 'mock-hist-5',
            studentName: studentName || 'Aspirant',
            examTarget: targetExam,
            selectedSubjects: ['Physics', 'Chemistry', 'Mathematics'],
            selectedChapters: ['Full Syllabus Mock Revision'],
            totalQuestions: 30,
            score: 98,
            maxScore: 120,
            correctCount: 25,
            incorrectCount: 2,
            unattemptedCount: 3,
            accuracy: 92,
            timeTakenSeconds: 2450,
            submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            answers: {},
          },
        ];
        setHistoryList(seedAttempts);
      }
    };

    loadHistory();

    const handleUpdate = () => loadHistory();
    window.addEventListener('prepskm_data_updated', handleUpdate);
    return () => window.removeEventListener('prepskm_data_updated', handleUpdate);
  }, [studentName, targetExam]);

  // Last 10 mock test attempts for the Recharts visualization (chronological: oldest to newest)
  const last10Chronological = useMemo(() => {
    const sorted = [...historyList].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
    const slice = sorted.slice(-10);
    return slice.map((item, index) => {
      const percentage = Math.round((item.score / (item.maxScore || 1)) * 100);
      const dateObj = new Date(item.submittedAt);
      const dateLabel = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
      const examShort = item.examTarget?.split(' ')[0] || 'CBT';
      return {
        id: item.id,
        attemptNumber: index + 1,
        label: `Test #${index + 1}`,
        date: dateLabel,
        fullDate: dateObj.toLocaleDateString(),
        score: Math.max(0, item.score),
        maxScore: item.maxScore,
        percentage,
        accuracy: item.accuracy || percentage,
        correct: item.correctCount,
        incorrect: item.incorrectCount,
        unattempted: item.unattemptedCount,
        examTarget: item.examTarget,
        chapters: item.selectedChapters?.slice(0, 2).join(', ') || 'Syllabus',
        rawItem: item,
      };
    });
  }, [historyList]);

  // Key KPI metrics
  const stats = useMemo(() => {
    if (historyList.length === 0) {
      return {
        peakScore: 0,
        peakMax: 100,
        avgAccuracy: 0,
        totalAttempts: 0,
        latestScore: 0,
        latestPercent: 0,
        trend: '+0%',
      };
    }
    const peak = historyList.reduce(
      (prev, curr) => (curr.score > prev.score ? curr : prev),
      historyList[0]
    );
    const avgAcc = Math.round(
      historyList.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / historyList.length
    );
    const latest = historyList[0];
    const latestPct = Math.round((latest.score / (latest.maxScore || 1)) * 100);

    let trendVal = '+0%';
    if (historyList.length >= 2) {
      const prevPct = Math.round(
        (historyList[1].score / (historyList[1].maxScore || 1)) * 100
      );
      const diff = latestPct - prevPct;
      trendVal = diff >= 0 ? `+${diff}%` : `${diff}%`;
    }

    return {
      peakScore: peak.score,
      peakMax: peak.maxScore,
      avgAccuracy: avgAcc,
      totalAttempts: historyList.length,
      latestScore: latest.score,
      latestPercent: latestPct,
      trend: trendVal,
    };
  }, [historyList]);

  // Handle Marksheet Download
  const handleDownloadMarksheet = async () => {
    if (!marksheetRef.current) return;
    setIsDownloading(true);
    try {
      // Use html2canvas from window CDN if available
      const html2canvas = (window as any).html2canvas;
      if (html2canvas) {
        const canvas = await html2canvas(marksheetRef.current, {
          scale: 2,
          backgroundColor: '#090d16',
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `Prepskm-Verified-Marksheet-${selectedAttemptForMarksheet?.studentName || 'Student'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Marksheet download error:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-xs border border-indigo-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" /> NTA CBT Analytics
            </span>
            <span className="text-xs text-slate-400">Verified Test Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Mock Test History & Score Progression
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time visual trajectory of your last 10 mock test attempts. Re-attempt any test to eliminate negative marking and download verified marksheets.
          </p>
        </div>

        {onStartNewTest && (
          <button
            onClick={onStartNewTest}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition active:scale-95 flex items-center gap-2 shrink-0"
          >
            <RotateCcw className="w-4 h-4" /> Start New Mock Test
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Peak Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.peakScore} <span className="text-xs font-semibold text-slate-500">/ {stats.peakMax}</span>
          </div>
          <p className="text-[10px] text-amber-400 mt-1">Best Personal Record</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {stats.avgAccuracy}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">NTA Scoring Efficiency</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recent Trend</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-400">
            {stats.trend}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Since Last Attempt</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tests</span>
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.totalAttempts}
          </div>
          <p className="text-[10px] text-cyan-400 mt-1">Recorded in Registry</p>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CONTAINER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {/* Visualization Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              Score Progression (Last 10 Mock Attempts)
            </h3>
            <p className="text-xs text-slate-400">
              Interactive progression curve illustrating score improvement and NTA speed pacing.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setChartMetric('score')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                chartMetric === 'score'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Score (+4 / -1)
            </button>
            <button
              onClick={() => setChartMetric('accuracy')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                chartMetric === 'accuracy'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Accuracy %
            </button>
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="w-full h-72 sm:h-80 pt-2">
          {last10Chronological.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'score' ? (
                <AreaChart
                  data={last10Chronological}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const comp = getPerformanceComplement(data.percentage);
                        return (
                          <div className="bg-slate-950 border border-indigo-500/40 p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 max-w-xs">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                              <span className="font-black text-indigo-400">{data.label} ({data.date})</span>
                              <span className="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                                {data.examTarget}
                              </span>
                            </div>
                            <div className="text-sm font-black text-white">
                              Score: <span className="text-emerald-400">{data.score}</span> / {data.maxScore} Marks ({data.percentage}%)
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-300 pt-1">
                              <div className="text-emerald-400 font-semibold">✓ {data.correct} Correct</div>
                              <div className="text-rose-400 font-semibold">✗ {data.incorrect} Wrong</div>
                              <div className="text-slate-400 font-semibold">○ {data.unattempted} Skip</div>
                            </div>
                            <div className="text-[10px] text-amber-300 pt-1 border-t border-slate-800/80">
                              💬 {comp.headline}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={Math.round(
                      last10Chronological.reduce((acc, c) => acc + c.score, 0) /
                        last10Chronological.length
                    )}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Avg Score',
                      fill: '#f59e0b',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Marks Scored"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ fill: '#6366f1', stroke: '#c7d2fe', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <LineChart
                  data={last10Chronological}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-emerald-500/40 p-3 rounded-2xl shadow-2xl text-xs space-y-1">
                            <p className="font-bold text-white">{data.label} Accuracy</p>
                            <p className="text-emerald-400 font-black text-sm">{data.accuracy}%</p>
                            <p className="text-[10px] text-slate-400">Chapters: {data.chapters}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{
                      value: '80% Target',
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy %"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', stroke: '#a7f3d0', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No test attempts found yet. Attempt your first mock test to see your curve!
            </div>
          )}
        </div>
      </div>

      {/* DETAILED ATTEMPTS REGISTRY & MARKSHEET ACCESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            Verified Test History & Marksheets ({historyList.length})
          </h3>
          <span className="text-xs text-slate-400">Re-attempt anytime to boost score</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {historyList.map((attempt, index) => {
            const percent = Math.round((attempt.score / (attempt.maxScore || 1)) * 100);
            const comp = getPerformanceComplement(percent);
            const dateStr = new Date(attempt.submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={attempt.id || index}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition shadow-lg space-y-3.5"
              >
                {/* Top Attempt Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-black flex items-center justify-center">
                      #{historyList.length - index}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        {attempt.examTarget} Mock Test
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> {dateStr}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      percent >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : percent >= 50
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {percent}% Marks
                  </span>
                </div>

                {/* Score and Stats Row */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Score</span>
                    <span className="font-extrabold text-white">
                      {attempt.score} <span className="text-[10px] text-slate-500">/{attempt.maxScore}</span>
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Correct</span>
                    <span className="font-extrabold text-emerald-400">+{attempt.correctCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Negative</span>
                    <span className="font-extrabold text-rose-400">-{attempt.incorrectCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Accuracy</span>
                    <span className="font-extrabold text-indigo-400">{attempt.accuracy}%</span>
                  </div>
                </div>

                {/* Performance Complement Badge */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{comp.headline}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setSelectedAttemptForMarksheet(attempt)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 font-bold text-xs border border-indigo-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Marksheet</span>
                  </button>

                  {onReattemptTest && (
                    <button
                      onClick={() => onReattemptTest(attempt)}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-attempt Test</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VERIFIED MARKSHEET MODAL */}
      {selectedAttemptForMarksheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-white text-base">Verified Academic Marksheet</h3>
              </div>
              <button
                onClick={() => setSelectedAttemptForMarksheet(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Printable Marksheet Certificate Element */}
            <div
              ref={marksheetRef}
              className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 border-2 border-indigo-500/30 text-white space-y-6 shadow-inner"
            >
              {/* Certificate Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 tracking-tight">
                      PREPSKM
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      OFFICIAL CBT RESULT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Verified Evaluation Engine • @unfiltereddsumit
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p className="font-mono text-indigo-300 font-bold">
                    CERT-{selectedAttemptForMarksheet.id.slice(-8).toUpperCase()}
                  </p>
                  <p>{new Date(selectedAttemptForMarksheet.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Candidate Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Candidate Name</span>
                  <span className="font-bold text-white text-sm">
                    {selectedAttemptForMarksheet.studentName || studentName || 'Aspirant'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Target Examination</span>
                  <span className="font-bold text-indigo-300 text-sm">
                    {selectedAttemptForMarksheet.examTarget}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Total Questions</span>
                  <span className="font-bold text-white">
                    {selectedAttemptForMarksheet.totalQuestions} Questions
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Duration</span>
                  <span className="font-bold text-white">
                    {Math.round(selectedAttemptForMarksheet.timeTakenSeconds / 60)} Minutes
                  </span>
                </div>
              </div>

              {/* Scorecard Hero Numbers */}
              <div className="p-5 rounded-2xl bg-indigo-900/20 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block">
                    Marks Obtained
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-300">
                    {selectedAttemptForMarksheet.score}{' '}
                    <span className="text-lg text-slate-400 font-normal">
                      / {selectedAttemptForMarksheet.maxScore}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Accuracy</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {selectedAttemptForMarksheet.accuracy}%
                  </span>
                </div>
              </div>

              {/* Detailed Marking Scheme */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-300 block">Correct (+4)</span>
                  <span className="text-base font-black text-emerald-400">
                    {selectedAttemptForMarksheet.correctCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] text-rose-300 block">Incorrect (-1)</span>
                  <span className="text-base font-black text-rose-400">
                    {selectedAttemptForMarksheet.incorrectCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Unattempted (0)</span>
                  <span className="text-base font-black text-slate-300">
                    {selectedAttemptForMarksheet.unattemptedCount}
                  </span>
                </div>
              </div>

              {/* Personal Mentor Complement Note */}
              {(() => {
                const pct = Math.round(
                  (selectedAttemptForMarksheet.score / (selectedAttemptForMarksheet.maxScore || 1)) * 100
                );
                const comp = getPerformanceComplement(pct);
                return (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" /> Mentor Feedback (@unfiltereddsumit)
                    </div>
                    <p className="text-xs font-semibold text-white">{comp.headline}</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{comp.message}</p>
                  </div>
                );
              })()}

              {/* Official Seal / Signature Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Prepskm Digital Assessment Engine</p>
                  <p>Telegram: @prepskm • Personal: @unfiltreddsumit</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-bold text-[10px]">
                    VERIFIED RESULT
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAttemptForMarksheet(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadMarksheet}
                disabled={isDownloading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Generating Image...' : 'Download Verified Marksheet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
