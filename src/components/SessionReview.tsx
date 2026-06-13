import React from 'react';
import { motion } from 'motion/react';
import { QuestionResult } from '../types';
import { Trophy, ChevronRight, CheckCircle, XCircle, Clock, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SessionReviewProps {
  results: QuestionResult[];
  xpEarned: number;
  onRestart: () => void;
  onExit: () => void;
}

const OPERATION_COLORS = {
  addition: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  subtraction: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  multiplication: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  division: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
};

export default function SessionReview({ results, xpEarned, onRestart, onExit }: SessionReviewProps) {
  const totalQuestions = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const wrongCount = totalQuestions - correctCount;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  
  // Average speed in seconds
  const correctResults = results.filter((r) => r.isCorrect);
  const avgSpeed = correctResults.length > 0 
    ? (correctResults.reduce((sum, r) => sum + r.timeTakenMs, 0) / correctResults.length / 1000).toFixed(1)
    : '0.0';

  // Find the toughest question (the one they spent the most time on or got incorrect)
  const toughestQuestion = results.length > 0 
    ? [...results].sort((a, b) => b.timeTakenMs - a.timeTakenMs)[0]
    : null;

  return (
    <motion.div
      id="session-review-component"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto p-6 bg-[#0A0A0C] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden font-sans text-slate-100 relative"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3.5 border border-indigo-500/20">
          <Trophy className="h-6 w-6 text-indigo-400 animate-pulse" />
        </div>
        <h2 id="review-title" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-100 to-indigo-50 bg-clip-text text-transparent italic select-none">
          Session Completed!
        </h2>
        <p className="text-slate-400 text-xs mt-1.5">Excellent practice run. Precision practice trains intuitive computation.</p>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        <div className="bg-[#0F1115]/60 border border-slate-800 p-3 rounded-xl text-center">
          <Zap className="h-4 w-4 text-amber-400 mx-auto mb-1.5 animate-pulse" />
          <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-widest font-mono">XP GAINED</span>
          <span className="text-lg font-extrabold font-mono text-amber-400 leading-tight">+{xpEarned}</span>
        </div>

        <div className="bg-[#0F1115]/60 border border-slate-800 p-3 rounded-xl text-center">
          <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto mb-1.5" />
          <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-widest font-mono">ACCURACY</span>
          <span className="text-lg font-extrabold font-mono text-emerald-400 leading-tight">{accuracy}%</span>
        </div>

        <div className="bg-[#0F1115]/60 border border-slate-800 p-3 rounded-xl text-center">
          <Clock className="h-4 w-4 text-indigo-400 mx-auto mb-1.5" />
          <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-widest font-mono">AVG SPEED</span>
          <span className="text-lg font-extrabold font-mono text-indigo-400 leading-tight">{avgSpeed}s</span>
        </div>
      </div>

      {/* Rating Progression details */}
      <div className="bg-[#0F1115]/40 border border-slate-800/80 rounded-xl p-4 mb-6 relative z-10">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 font-mono">Adaptive Rating Updates</h3>
        <div className="space-y-2.5">
          {Array.from(new Set(results.map((r) => r.question.operation))).map((op) => {
            const opResults = results.filter((r) => r.question.operation === op);
            const netRating = opResults.reduce((sum, r) => sum + r.ratingChange, 0);
            const latestResult = opResults[opResults.length - 1];
            const currentOpRating = latestResult ? latestResult.newRating : 1000;

            return (
              <div key={op} className="flex justify-between items-center text-xs">
                <span className="capitalize text-slate-300 font-medium">{op}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400">Current ELO: <strong className="text-white font-semibold">{currentOpRating}</strong></span>
                  {netRating > 0 ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold font-mono rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                      <ArrowUpRight className="h-3 w-3" />
                      +{netRating}
                    </span>
                  ) : netRating < 0 ? (
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 font-bold font-mono rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                      <ArrowDownRight className="h-3 w-3" />
                      {netRating}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-bold font-mono rounded-md px-1.5 py-0.5">
                      0
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toughest Question Box */}
      {toughestQuestion && (
        <div className="bg-[#0F1115] border border-slate-800/60 rounded-xl p-4 mb-6 relative z-10 flex justify-between items-center bg-gradient-to-r from-rose-950/5 to-transparent">
          <div>
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest font-mono block mb-1">Toughest Challenge</span>
            <div className="text-white font-mono font-medium text-lg">
              {toughestQuestion.question.num1} {toughestQuestion.question.operandSymbol} {toughestQuestion.question.num2} = {toughestQuestion.question.correctAnswer}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Time spent: <span className="text-indigo-400 font-mono font-bold">{(toughestQuestion.timeTakenMs / 1000).toFixed(1)}s</span>
            </p>
          </div>
          <div className="text-right">
            {toughestQuestion.isCorrect ? (
              <span className="text-emerald-400 text-xs font-semibold bg-emerald-950/15 px-3 py-1.5 rounded-xl border border-emerald-9game border-emerald-500/25 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" /> Solved
              </span>
            ) : (
              <span className="text-rose-400 text-xs font-semibold bg-rose-950/15 px-3 py-1.5 rounded-xl border border-rose-500/25 flex items-center gap-1.5">
                <XCircle className="h-3 w-3" /> Missed
              </span>
            )}
          </div>
        </div>
      )}

      {/* History details drawer list */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5 font-mono">Practice Log ({totalQuestions})</h3>
        <div className="bg-[#0F1115]/30 border border-slate-800/50 rounded-xl max-h-40 overflow-y-auto space-y-1.5 p-2 scrollbar-thin">
          {results.map((result, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-800/20 border border-slate-800/30 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                {result.isCorrect ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                )}
                
                <span className="font-mono font-medium text-slate-200">
                  {result.question.num1} {result.question.operandSymbol} {result.question.num2} = {result.question.correctAnswer}
                </span>

                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${OPERATION_COLORS[result.question.operation]}`}>
                  {result.question.operation.slice(0, 3)}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
                <span>{(result.timeTakenMs / 1000).toFixed(1)}s</span>
                <span className={`font-semibold ${result.ratingChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.ratingChange >= 0 ? `+${result.ratingChange}` : result.ratingChange} ELO
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 relative z-10">
        <button
          id="review-exit-btn"
          onClick={onExit}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800/10 hover:bg-slate-800/30 text-slate-400 font-bold border border-slate-800/80 text-xs transition-colors cursor-pointer uppercase tracking-wider"
        >
          Exit Practice
        </button>

        <button
          id="review-restart-btn"
          onClick={onRestart}
          className="flex-2 py-3 px-5 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs border border-indigo-500/50 shadow-lg shadow-indigo-500/5 hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest font-sans"
        >
          <span>Practice Again</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
