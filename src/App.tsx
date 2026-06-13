import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats, OperationType, QuestionResult } from './types';
import TrainingSession from './components/TrainingSession';
import SessionReview from './components/SessionReview';
import StatsDashboard from './components/StatsDashboard';
import { 
  Plus, 
  Minus, 
  X, 
  TrendingUp, 
  Brain, 
  Flame, 
  Trophy, 
  Target, 
  BarChart2, 
  Award,
  Zap,
  RotateCcw
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'math_trainer_user_stats';

const DEFAULT_STATS: UserStats = {
  ratings: {
    addition: 1000,
    subtraction: 1000,
    multiplication: 1000,
    division: 1000,
  },
  bestStreak: 0,
  totalXP: 0,
  totalCorrect: 0,
  totalAsked: 0,
  totalTimeSpentMs: 0,
  recentSessions: [],
};

const OP_META = {
  addition: { name: 'Addition', symbol: '+', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 focus:ring-emerald-500/40 glow-emerald' },
  subtraction: { name: 'Subtraction', symbol: '−', color: 'bg-amber-500/10 border-amber-500/30 text-amber-500 focus:ring-amber-500/40 glow-amber' },
  multiplication: { name: 'Multiplication', symbol: '×', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400 focus:ring-purple-400/40 glow-purple' },
  division: { name: 'Division', symbol: '÷', color: 'bg-sky-500/10 border-sky-500/30 text-sky-400 focus:ring-sky-400/40 glow-sky' },
};

export default function App() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'review'>('setup');
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [selectedOps, setSelectedOps] = useState<OperationType[]>(['addition', 'subtraction']);
  const [timeLimit, setTimeLimit] = useState<number>(45); // default 45 seconds sprint
  const [showStats, setShowStats] = useState<boolean>(false);
  
  const [currentSessionResults, setCurrentSessionResults] = useState<QuestionResult[]>([]);
  const [currentSessionXPEarned, setCurrentSessionXPEarned] = useState<number>(0);

  // Load stats from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Fallback for missing fields standard safeguard
        const consolidated = {
          ...DEFAULT_STATS,
          ...parsed,
          ratings: {
            ...DEFAULT_STATS.ratings,
            ...(parsed.ratings || {}),
          },
        };
        setStats(consolidated);
      }
    } catch (e) {
      console.warn('Failed to parse stats from localStorage', e);
    }
  }, []);

  // Sync user stats to localStorage
  const saveStatsToStorage = (updatedStats: UserStats) => {
    setStats(updatedStats);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStats));
    } catch (e) {
      console.error('Failed to write stats to localStorage', e);
    }
  };

  // Trigger operation selection toggle
  const handleToggleOperation = (op: OperationType) => {
    setSelectedOps((prev) => {
      if (prev.includes(op)) {
        // Must have at least one active operation
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== op);
      } else {
        return [...prev, op];
      }
    });
  };

  // Reset Lifetime Stats
  const handleResetStats = () => {
    saveStatsToStorage(DEFAULT_STATS);
  };

  // Finished game - Save results
  const handleSessionFinish = (results: QuestionResult[], xpEarned: number) => {
    const totalSessionQuestions = results.length;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalSessionTime = results.reduce((sum, r) => sum + r.timeTakenMs, 0);

    // Calculate best streak in this session
    let currentStreakCount = 0;
    let maxSessionStreak = 0;
    results.forEach((r) => {
      if (r.isCorrect) {
        currentStreakCount++;
        if (currentStreakCount > maxSessionStreak) {
          maxSessionStreak = currentStreakCount;
        }
      } else {
        currentStreakCount = 0;
      }
    });

    const newBestStreak = Math.max(stats.bestStreak, maxSessionStreak);
    
    // Extract the final ELO scores from this session per operation
    const updatedRatings = { ...stats.ratings };
    selectedOps.forEach((op) => {
      const opResults = results.filter((r) => r.question.operation === op);
      if (opResults.length > 0) {
        // ELO is updated continuously to latest question result
        const latestRatingResult = opResults[opResults.length - 1];
        if (latestRatingResult) {
          updatedRatings[op] = latestRatingResult.newRating;
        }
      }
    });

    // Create session audit history item
    const newSessionRecord = {
      id: `session_${Date.now()}`,
      timestamp: Date.now(),
      totalXP: xpEarned,
      correctCount,
      totalCount: totalSessionQuestions,
      avgTimeMs: correctCount > 0 ? totalSessionTime / correctCount : 0,
      accuracy: totalSessionQuestions > 0 ? Math.round((correctCount / totalSessionQuestions) * 100) : 0,
      operations: [...selectedOps],
    };

    const updatedStats: UserStats = {
      ratings: updatedRatings,
      bestStreak: newBestStreak,
      totalXP: stats.totalXP + xpEarned,
      totalCorrect: stats.totalCorrect + correctCount,
      totalAsked: stats.totalAsked + totalSessionQuestions,
      totalTimeSpentMs: stats.totalTimeSpentMs + totalSessionTime,
      recentSessions: [newSessionRecord, ...stats.recentSessions.slice(0, 24)], // cap history list
    };

    saveStatsToStorage(updatedStats);
    setCurrentSessionResults(results);
    setCurrentSessionXPEarned(xpEarned);
    setGameState('review');
  };

  // Calculate Consolidated Mental ELO (Average of their ratings)
  const averageRating = Math.round(
    (stats.ratings.addition +
     stats.ratings.subtraction +
     stats.ratings.multiplication +
     stats.ratings.division) / 4
  );

  return (
    <div id="application-container" className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col items-center justify-center p-3 relative overflow-hidden">
      
      {/* Background elegant visual layout */}
      <div className="absolute top-[-20%] left-[-20%] w-100 h-100 bg-teal-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-100 h-100 bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {gameState === 'setup' && (
          <motion.div
            key="setup-screen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg bg-slate-900/60 border border-slate-800/80 p-6 rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Soft decorative radial flare */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-12 bg-teal-500/[0.12] rounded-full blur-xl pointer-events-none" />

            {/* Platform Header */}
            <header className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-3.5 border border-teal-500/20">
                <Brain className="h-6 w-6 text-teal-400" />
              </div>
              <h1 id="app-title" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-teal-100 to-emerald-400 bg-clip-text text-transparent italic select-none">
                MATH TRAINER
              </h1>
              <p className="text-slate-400 text-xs mt-1.5 font-medium select-none">
                Gamified mental core practice containing adaptive difficulty ELO rankings
              </p>
            </header>

            {/* Quick Profile Summary bar */}
            <section className="bg-slate-950/60 border border-slate-900 rounded-3xl p-4 mb-6 flex justify-between items-center relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div id="stat-accuracy-progress" className="h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-500/15 to-emerald-500/15 flex items-center justify-center border border-teal-500/10">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono">Consolidated ELO</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold font-mono text-slate-100">{averageRating}</span>
                    <span className="text-xxs text-teal-400 font-mono font-medium">Rating</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 text-center">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider font-mono">Solved</span>
                  <span className="text-sm font-bold font-mono text-slate-200">{stats.totalCorrect}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider font-mono">Accuracy</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {stats.totalAsked > 0 ? Math.round((stats.totalCorrect / stats.totalAsked) * 100) : 0}%
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider font-mono">Best Streak</span>
                  <span className="text-sm font-bold font-mono text-pink-500 flex items-center gap-0.5 justify-center">
                    <Flame className="h-3.5 w-3.5 inline shrink-0" />
                    {stats.bestStreak}
                  </span>
                </div>
              </div>
            </section>

            {/* Configuration segment */}
            <main className="space-y-5">
              {/* Op Selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block mb-3.5">
                  Select arithmetic disciplines
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(OP_META) as OperationType[]).map((op) => {
                    const meta = OP_META[op];
                    const isSelected = selectedOps.includes(op);

                    return (
                      <motion.button
                        key={op}
                        id={`op-select-${op}`}
                        type="button"
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleToggleOperation(op)}
                        className={`
                          h-16 rounded-2xl border p-3 flex items-center justify-between transition-all duration-300 relative cursor-pointer
                          ${
                            isSelected
                              ? `${meta.color} bg-slate-900 border-opacity-100 shadow-lg shadow-slate-950/45`
                              : 'bg-slate-950/20 border-slate-800/60 text-slate-500 opacity-60 hover:opacity-85'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Visual Indicator Checkbox */}
                          <div
                            className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border text-xxs font-bold transition-all duration-200
                              ${
                                isSelected
                                  ? 'bg-slate-100 border-transparent text-slate-900 scale-105'
                                  : 'border-slate-700/60'
                              }
                            `}
                          >
                            {isSelected && '✓'}
                          </div>
                          <span className="text-sm font-bold tracking-tight text-left capitalize">
                            {meta.name}
                          </span>
                        </div>
                        
                        <span className="text-xl font-mono font-extrabold select-none opacity-80">
                          {meta.symbol}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block mb-3.5">
                  Practice Sprint Speed
                </label>
                <div className="grid grid-cols-4 gap-2 bg-slate-950/45 p-1 rounded-2xl border border-slate-800/80">
                  {[30, 45, 60, 120].map((t) => (
                    <button
                      key={t}
                      id={`time-select-${t}`}
                      type="button"
                      onClick={() => setTimeLimit(t)}
                      className={`
                        py-2 text-xs font-bold rounded-xl transition-all font-mono cursor-pointer
                        ${
                          timeLimit === t
                            ? 'bg-slate-800 text-teal-400 border border-slate-700/50 shadow shadow-slate-900'
                            : 'text-slate-500 hover:text-slate-300'
                        }
                      `}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Onboarding controls */}
              <div className="pt-4 flex gap-3">
                <button
                  id="stats-dashboard-toggle"
                  type="button"
                  onClick={() => setShowStats(true)}
                  className="h-14 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm font-semibold hover:text-white"
                >
                  <BarChart2 className="h-4.5 w-4.5" />
                  <span>Profile Stats</span>
                </button>

                <motion.button
                  id="start-workout-btn"
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGameState('playing')}
                  className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-extrabold text-base tracking-wide shadow-lg shadow-teal-500/10 hover:from-teal-400 hover:to-emerald-400 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="h-5 w-5 fill-current" />
                  <span>START WORKOUT</span>
                </motion.button>
              </div>
            </main>

            {/* Instruction Footer tip */}
            <div className="mt-6 text-center select-none border-t border-slate-900 pt-4">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-medium">
                Tip: Rapid correct responses boost ELO ratings and add backup seconds.
              </span>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="playing-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg z-10"
          >
            <TrainingSession
              stats={stats}
              selectedOperations={selectedOps}
              initialTimeLimit={timeLimit}
              onSessionFinish={handleSessionFinish}
              onExit={() => setGameState('setup')}
            />
          </motion.div>
        )}

        {gameState === 'review' && (
          <motion.div
            key="review-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl z-10"
          >
            <SessionReview
              results={currentSessionResults}
              xpEarned={currentSessionXPEarned}
              onRestart={() => setGameState('playing')}
              onExit={() => setGameState('setup')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Statistics Overlay Modal */}
      <AnimatePresence>
        {showStats && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <StatsDashboard
              stats={stats}
              onResetStats={handleResetStats}
              onClose={() => setShowStats(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
