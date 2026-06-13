import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserStats, OperationType } from '../types';
import { ratingToLevel } from '../utils/mathEngine';
import { Trophy, Zap, Clock, Activity, RotateCcw, Flame, CheckCircle2, ChevronRight } from 'lucide-react';

interface StatsDashboardProps {
  stats: UserStats;
  onResetStats: () => void;
  onClose: () => void;
}

const OPERATION_META = {
  addition: { name: 'Addition', color: 'from-emerald-500 to-teal-400', txt: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  subtraction: { name: 'Subtraction', color: 'from-amber-500 to-orange-400', txt: 'text-amber-400', bg: 'bg-amber-500/10' },
  multiplication: { name: 'Multiplication', color: 'from-purple-500 to-indigo-400', txt: 'text-purple-400', bg: 'bg-purple-500/10' },
  division: { name: 'Division', color: 'from-sky-500 to-blue-400', txt: 'text-sky-400', bg: 'bg-sky-500/10' },
};

function getLevelLabel(level: number): string {
  switch (level) {
    case 1: return 'Rookie I';
    case 2: return 'Rookie II';
    case 3: return 'Candidate';
    case 4: return 'Specialist';
    case 5: return 'Expert';
    case 6: return 'Master';
    case 7: return 'Grandmaster';
    case 8: return 'Legend';
    default: return 'Rookie I';
  }
}

export default function StatsDashboard({ stats, onResetStats, onClose }: StatsDashboardProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const totalQuestions = stats.totalAsked;
  const overallAccuracy = totalQuestions > 0 ? Math.round((stats.totalCorrect / totalQuestions) * 100) : 0;
  const averageSpeedSec = stats.totalCorrect > 0 ? (stats.totalTimeSpentMs / stats.totalCorrect / 1000).toFixed(1) : '0.0';

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      id="stats-dashboard-modal"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-[#0A0A0C] border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative max-w-2xl w-full mx-auto overflow-hidden font-sans text-slate-100"
    >
      {/* Background radial gradients for premium ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-200 to-indigo-50 bg-clip-text text-transparent italic select-none">Practice Performance Stats</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Adaptive rank measurements tuned to historical practice speed</p>
        </div>
        <button
          id="close-stats"
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800/10 hover:bg-slate-850 transition-colors cursor-pointer border border-slate-800"
        >
          <span className="text-slate-400 text-lg font-bold">×</span>
        </button>
      </div>

      {/* Key Metric Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
        <div className="bg-[#0F1115]/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Trophy className="h-4 w-4" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500 font-mono">Total XP</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{stats.totalXP}</div>
        </div>

        <div className="bg-[#0F1115]/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500 font-mono">Accuracy</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{overallAccuracy}%</div>
        </div>

        <div className="bg-[#0F1115]/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Flame className="h-4 w-4" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500 font-mono">Best Streak</span>
          </div>
          <div className="text-xl font-bold font-mono text-indigo-400">{stats.bestStreak}</div>
        </div>

        <div className="bg-[#0F1115]/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sky-400 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500 font-mono">Avg Speed</span>
          </div>
          <div className="text-xl font-bold font-mono text-sky-400">{averageSpeedSec}s</div>
        </div>
      </div>

      {/* Operation Skill Rankings */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 font-mono flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-450" />
          Skill Ratings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(stats.ratings) as OperationType[]).map((op) => {
            const rating = stats.ratings[op];
            const level = ratingToLevel(rating);
            const meta = OPERATION_META[op];

            // Progress inside level (200-2600 ELO range divided cleanly)
            let levelMin = 200;
            let levelMax = 600;
            if (level === 2) { levelMin = 600; levelMax = 950; }
            else if (level === 3) { levelMin = 950; levelMax = 1250; }
            else if (level === 4) { levelMin = 1250; levelMax = 1500; }
            else if (level === 5) { levelMin = 1500; levelMax = 1800; }
            else if (level === 6) { levelMin = 1800; levelMax = 2100; }
            else if (level === 7) { levelMin = 2100; levelMax = 2400; }
            else if (level === 8) { levelMin = 2400; levelMax = 3000; }

            const percentage = Math.min(100, Math.max(5, ((rating - levelMin) / (levelMax - levelMin)) * 100));

            return (
              <div
                key={op}
                id={`rating-card-${op}`}
                className="bg-[#0F1115]/30 border border-slate-800/70 rounded-xl p-4 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${meta.color}`} />
                    <span className="font-semibold text-xs tracking-tight">{meta.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono font-medium block">Level {level}</span>
                    <p className={`text-xs font-bold uppercase tracking-wider ${meta.txt}`}>{getLevelLabel(level)}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mt-1 mb-2">
                  <span className="text-2xl font-bold font-mono tracking-tight text-white">{rating}</span>
                  <span className="text-[10px] text-slate-500 font-mono">ELO</span>
                </div>

                {/* Custom modern progress bar */}
                <div className="w-full bg-[#12141C] h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${meta.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                  <span>{levelMin}</span>
                  <span>{levelMax}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History log */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 font-mono flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-400" />
          Recent Practice Sessions
        </h3>
        
        {stats.recentSessions.length === 0 ? (
          <div className="bg-[#0F1115]/10 border border-dashed border-slate-800 rounded-xl p-6 text-center">
            <p className="text-xs text-slate-500 font-medium font-mono">No practice runs completed yet. Play a round today!</p>
          </div>
        ) : (
          <div className="max-h-40 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
            {stats.recentSessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="bg-[#0F1115]/35 border border-slate-800 p-3 rounded-xl flex justify-between items-center flex-wrap gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-200 font-semibold font-mono text-xs text-amber-500 flex items-center gap-1">
                      +{session.totalXP} XP
                    </span>
                    <span className="text-slate-650 text-[10px]">•</span>
                    <span className="text-slate-400 text-[11px] font-mono">{formatTimestamp(session.timestamp)}</span>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {session.operations.map((op) => (
                      <span
                        key={op}
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${metaOfOp(op).bg} ${metaOfOp(op).txt} font-bold font-mono tracking-wider`}
                      >
                        {op.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-500 block text-[9px] font-bold">ACCURACY</span>
                    <span className="text-emerald-400 font-bold">{session.accuracy}%</span>
                  </div>
                  <div className="text-right items-end">
                    <span className="text-slate-500 block text-[9px] font-bold">SPEED</span>
                    <span className="text-indigo-400 font-bold">{(session.avgTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-900/60 z-10 relative">
        {!showConfirmReset ? (
          <button
            id="reset-stats-btn"
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-450 text-xs font-medium py-2 px-3 rounded-xl hover:bg-rose-500/5 transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Lifetime Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-rose-400 font-medium font-mono">Are you sure? This resets level history.</span>
            <button
              id="confirm-reset-stats-btn"
              onClick={() => {
                onResetStats();
                setShowConfirmReset(false);
              }}
              className="text-xs bg-rose-950/20 text-rose-400 border border-rose-900/40 font-bold px-2.5 py-1 rounded-lg hover:bg-rose-900/30 cursor-pointer"
            >
              Clear Live Stats
            </button>
            <button
              id="cancel-reset-stats-btn"
              onClick={() => setShowConfirmReset(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        <button
          id="stats-close-bottom"
          onClick={onClose}
          className="bg-indigo-600/20 text-indigo-400 font-bold text-xs border border-indigo-500/50 shadow-lg shadow-indigo-500/5 py-2 px-6 rounded-xl hover:bg-indigo-500/30 transition-colors cursor-pointer uppercase tracking-wider"
        >
          Back to Practice
        </button>
      </div>
    </motion.div>
  );
}

// Utility to fetch operation configurations easily
function metaOfOp(op: OperationType) {
  return OPERATION_META[op] || { name: 'Math', rgb: 'from-slate-500 to-slate-400', txt: 'text-slate-400', bg: 'bg-slate-500/10' };
}
