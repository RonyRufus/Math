import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MathQuestion, OperationType, QuestionResult, UserStats } from '../types';
import { generateQuestion, calculateRatingChange } from '../utils/mathEngine';
import { playSuccessChime, playErrorBuzz, playWarningBeep, playLevelUpTrumpet } from '../utils/audio';
import Numpad from './Numpad';
import { Volume2, VolumeX, Pause, Play, Award, Zap, Flame, Clock } from 'lucide-react';

interface TrainingSessionProps {
  stats: UserStats;
  selectedOperations: OperationType[];
  initialTimeLimit: number; // in seconds (e.g., 45s)
  onSessionFinish: (results: QuestionResult[], xpEarned: number) => void;
  onExit: () => void;
}

interface FloatingText {
  id: string;
  text: string;
  colorClass: string;
  xOffset: number;
}

export default function TrainingSession({
  stats,
  selectedOperations,
  initialTimeLimit = 60,
  onSessionFinish,
  onExit,
}: TrainingSessionProps) {
  // Game states
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(initialTimeLimit);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreakThisSession, setBestStreakThisSession] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [shakeActive, setShakeActive] = useState<boolean>(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [currentXP, setCurrentXP] = useState<number>(0);
  
  // Track continuous ELO during the session
  const [tempRatings, setTempRatings] = useState<Record<OperationType, number>>(() => ({ ...stats.ratings }));

  const questionStartTime = useRef<number>(Date.now());
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const lastSecRef = useRef<number>(initialTimeLimit);

  // Pick a random operation from the selected operations list
  const getRandomOperation = useCallback(() => {
    const idx = Math.floor(Math.random() * selectedOperations.length);
    return selectedOperations[idx];
  }, [selectedOperations]);

  // Load a new question based on the operational ELO rating
  const loadNextQuestion = useCallback((op: OperationType) => {
    const currentRating = tempRatings[op];
    const newQuestion = generateQuestion(op, currentRating);
    setCurrentQuestion(newQuestion);
    setTypedAnswer('');
    questionStartTime.current = Date.now();
  }, [tempRatings]);

  // Trigger floating combat visual feedback
  const triggerFloatingText = (text: string, colorClass: string) => {
    const id = `float_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const xOffset = Math.floor(Math.random() * 80) - 40; // random offset to avoid overlapping
    setFloatingTexts((prev) => [...prev, { id, text, colorClass, xOffset }]);
    
    // Clear after animation runs
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  // Check user answer as they type or when they press submit
  const checkAnswer = useCallback((answerStr: string, isFinalSubmit = false) => {
    if (!currentQuestion) return;
    
    const parsedUserAnswer = parseInt(answerStr, 10);
    const correctVal = currentQuestion.correctAnswer;
    const correctValStr = correctVal.toString();

    // 1. Exact correct match
    if (parsedUserAnswer === correctVal) {
      const timeTakenMs = Date.now() - questionStartTime.current;
      
      // Calculate ELO update
      const { ratingChange, newRating, xpGained } = calculateRatingChange(
        tempRatings[currentQuestion.operation],
        true,
        timeTakenMs,
        currentQuestion.difficultyLevel
      );

      // Audio feedback
      if (soundEnabled) playSuccessChime();

      // UI XP and time bonuses
      setCurrentXP((prev) => prev + xpGained);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreakThisSession) {
        setBestStreakThisSession(newStreak);
      }

      // Time bonus algorithm based on operations speed
      // Rookie levels (level 1-2): +2s, Intermediate: +3s, Legends: +5s
      const timeBonus = Math.min(6, Math.max(2, currentQuestion.difficultyLevel));
      setTimeLeft((prev) => Math.min(initialTimeLimit, prev + timeBonus));

      // Trigger floating combo score
      triggerFloatingText(`+${timeBonus}s`, 'text-emerald-400 font-mono font-bold');
      triggerFloatingText(`+${xpGained} XP`, 'text-amber-300 font-mono font-medium');
      if (newStreak % 5 === 0) {
        triggerFloatingText(`Streak ×${newStreak}!`, 'text-pink-400 font-extrabold text-sm');
        if (soundEnabled) playLevelUpTrumpet();
      }

      // Add result record
      const result: QuestionResult = {
        question: currentQuestion,
        typedAnswer: answerStr,
        isCorrect: true,
        timeTakenMs,
        xpGained,
        newRating,
        ratingChange,
      };

      setResults((prev) => [...prev, result]);

      // Update ratings representation
      setTempRatings((prev) => ({
        ...prev,
        [currentQuestion.operation]: newRating,
      }));

      // Load next
      setTimeout(() => {
        const nextOp = getRandomOperation();
        loadNextQuestion(nextOp);
      }, 50);

      return;
    }

    // 2. Length matched but wrong (e.g. typing 3 digits for a 3 digit answer)
    // We also double check if it doesn't match signs or have decimals
    const isMaxLengthReached = answerStr.length >= correctValStr.length && 
                              !(correctVal < 0 && answerStr === '-') && // let negative sign carry
                              !(correctValStr === '0' && answerStr === '');

    if (isMaxLengthReached || isFinalSubmit) {
      // Flag incorrect attempt
      if (soundEnabled) playErrorBuzz();
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 400);

      const timeTakenMs = Date.now() - questionStartTime.current;
      
      // ELO degradation
      const { ratingChange, newRating, xpGained } = calculateRatingChange(
        tempRatings[currentQuestion.operation],
        false,
        timeTakenMs,
        currentQuestion.difficultyLevel
      );

      // Penalize timer seconds
      setTimeLeft((prev) => Math.max(0, prev - 4));
      triggerFloatingText(`-5s`, 'text-rose-500 font-mono font-bold');
      setStreak(0); // Break streak

      const result: QuestionResult = {
        question: currentQuestion,
        typedAnswer: answerStr,
        isCorrect: false,
        timeTakenMs,
        xpGained,
        newRating,
        ratingChange,
      };

      setResults((prev) => [...prev, result]);

      // Update local ratings
      setTempRatings((prev) => ({
        ...prev,
        [currentQuestion.operation]: newRating,
      }));

      // Reset text box or let user retype.
      // Auto-clear answer on mistake so they can retype instantly!
      setTimeout(() => {
        setTypedAnswer('');
        questionStartTime.current = Date.now(); // reset timer for retry of operation
      }, 300);
    }
  }, [currentQuestion, streak, bestStreakThisSession, tempRatings, soundEnabled, getRandomOperation, loadNextQuestion, initialTimeLimit]);

  // Handle number click on virtual keypad
  const handleNumberClick = (num: string) => {
    if (isPaused) return;
    const newAnswer = typedAnswer + num;
    setTypedAnswer(newAnswer);
    checkAnswer(newAnswer);
  };

  // Backspace logic
  const handleBackspace = () => {
    if (isPaused) return;
    setTypedAnswer((prev) => prev.slice(0, -1));
  };

  // Clear typed text
  const handleClear = () => {
    if (isPaused) return;
    setTypedAnswer('');
  };

  // Manual submission / Enter key
  const handleSubmit = () => {
    if (isPaused) return;
    checkAnswer(typedAnswer, true);
  };

  // Minus sign negate
  const handleNegate = () => {
    if (isPaused) return;
    setTypedAnswer((prev) => {
      if (prev.startsWith('-')) {
        return prev.slice(1);
      } else {
        return '-' + prev;
      }
    });
  };

  // Countdown clock tickers
  useEffect(() => {
    if (isPaused) {
      if (timerInterval.current) clearInterval(timerInterval.current);
      return;
    }

    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerInterval.current) clearInterval(timerInterval.current);
          return 0;
        }
        
        const nextTime = prev - 1;
        // Warning sound trigger on last 5 seconds
        if (nextTime <= 5 && soundEnabled) {
          playWarningBeep();
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isPaused, soundEnabled]);

  // Initialize first question on start
  useEffect(() => {
    if (selectedOperations.length > 0 && !currentQuestion) {
      const initialOp = getRandomOperation();
      loadNextQuestion(initialOp);
    }
  }, [selectedOperations, currentQuestion, getRandomOperation, loadNextQuestion]);

  // Handle Game Over
  useEffect(() => {
    if (timeLeft === 0 && results.length > 0) {
      onSessionFinish(results, currentXP);
    }
  }, [timeLeft, results, currentXP, onSessionFinish]);

  // Utility to obtain color scheme metadata of the active card
  const getOpColor = () => {
    if (!currentQuestion) return 'border-slate-800 text-indigo-400 bg-[#0F1115]/60';
    switch (currentQuestion.operation) {
      case 'addition': return 'border-emerald-500/25 text-emerald-400 bg-[#0F1115]/50 shadow-sm shadow-emerald-950/5';
      case 'subtraction': return 'border-amber-500/25 text-amber-500 bg-[#0F1115]/50 shadow-sm shadow-amber-950/5';
      case 'multiplication': return 'border-indigo-500/25 text-indigo-400 bg-[#0F1115]/50 shadow-sm shadow-indigo-950/5';
      case 'division': return 'border-sky-500/25 text-sky-400 bg-[#0F1115]/50 shadow-sm shadow-sky-950/5';
      case 'squares': return 'border-fuchsia-500/25 text-fuchsia-400 bg-[#0F1115]/50 shadow-sm shadow-fuchsia-950/5';
      case 'roots': return 'border-cyan-500/25 text-cyan-400 bg-[#0F1115]/50 shadow-sm shadow-cyan-950/5';
      case 'algebra': return 'border-rose-500/25 text-rose-400 bg-[#0F1115]/50 shadow-sm shadow-rose-950/5';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col min-h-[90vh] justify-between p-4 bg-[#0A0A0C] text-slate-100 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
      {/* Dynamic ambient decoration background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating feedback indicators */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
        <AnimatePresence>
          {floatingTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -60, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`absolute text-center select-none font-bold text-lg whitespace-nowrap ${item.colorClass}`}
              style={{ left: item.xOffset }}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Controls Header bar */}
      <div className="flex justify-between items-center bg-[#0F1115]/60 p-3 rounded-2xl border border-slate-800/50 relative z-20">
        <div className="flex items-center gap-1.5">
          <button
            id="session-exit"
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer border border-slate-800 font-medium transition-all"
          >
            Quit Practice
          </button>
        </div>

        {/* HUD: Score, Streak */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/5 py-1.5 px-3 rounded-lg border border-amber-500/20">
            <Award className="h-3.5 w-3.5" />
            <span className="font-mono">{currentXP} XP</span>
          </div>

          <AnimatePresence mode="popLayout">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 py-1.5 px-3 rounded-lg border border-indigo-500/20"
              >
                <Flame className="h-3.5 w-3.5" />
                <span className="font-mono">×{streak}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound volume controller */}
          <button
            id="sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
          </button>

          {/* Pause */}
          <button
            id="pause-toggle"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="h-4 w-4 text-emerald-400" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Countdown Progress Slider */}
      <div className="mt-4 relative z-10">
        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1 font-mono">
          <span className="flex items-center gap-1 text-slate-400 font-semibold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
            Time Left
          </span>
          <span className={`font-bold font-mono ${timeLeft <= 10 ? 'text-rose-500 animate-pulse text-sm' : 'text-slate-200'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="w-full bg-[#12141C] h-1.5 rounded-full overflow-hidden border border-slate-800/40">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${
              timeLeft <= 10 ? 'from-rose-600 to-rose-400' : 'from-indigo-500 to-indigo-400'
            }`}
            animate={{ width: `${(timeLeft / initialTimeLimit) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Active Question Core Stage */}
      <div className="my-auto py-8 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {isPaused ? (
            <motion.div
              key="paused-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <h2 id="pause-screen-title" className="text-2xl font-bold mb-2 text-neutral-200 font-display">Practice Paused</h2>
              <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">
                Take a deep breath. Practice timer and current streak are resting safely.
              </p>
              <button
                id="resume-btn"
                onClick={() => setIsPaused(false)}
                className="bg-indigo-600/20 border border-indigo-500/50 text-indigo-400 font-bold px-8 py-3 rounded-xl hover:bg-indigo-500/30 cursor-pointer shadow-lg shadow-indigo-500/5 transition-all text-xs uppercase tracking-wider"
              >
                Resume Training
              </button>
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className={`w-full flex flex-col items-center justify-center`}
            >
              <p className="text-[10px] uppercase tracking-[0.16em] font-medium text-slate-500 mb-3.5 font-mono">
                {currentQuestion.operation} • Level {currentQuestion.difficultyLevel} [ELO {tempRatings[currentQuestion.operation]}]
              </p>

              {/* Central Math equation display card */}
              <motion.div
                id="equation-stage-card"
                animate={shakeActive ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`w-full max-w-sm rounded-[1.25rem] border min-h-36 p-6 flex flex-col items-center justify-center shadow-lg transition-all duration-300 ${getOpColor()}`}
              >
                {/* Equation numbers */}
                <div id="math-expression" className="flex items-center gap-4 text-4xl sm:text-5xl font-mono font-medium text-white select-none">
                  {currentQuestion.operation === 'squares' ? (
                    <div className="flex items-center">
                      <span>{currentQuestion.num1}</span>
                      <span className="text-slate-400 select-none text-2xl align-super -mt-4">²</span>
                      <span className="text-slate-400 text-3xl ml-2 mr-2">=</span>
                    </div>
                  ) : currentQuestion.operation === 'roots' ? (
                    <div className="flex items-center">
                      <span className="text-slate-400 select-none text-4xl mr-1">√</span>
                      <span className="underline decoration-slate-400 underline-offset-4">{currentQuestion.num1}</span>
                      <span className="text-slate-400 text-3xl ml-2 mr-2">=</span>
                    </div>
                  ) : currentQuestion.operation === 'algebra' ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-2xl font-bold bg-slate-950/80 px-5 py-2.5 rounded-2xl border border-slate-800/80 text-slate-100 select-none text-center font-mono my-2 tracking-wide">
                        {currentQuestion.formula}
                      </div>
                      <div className="flex items-center gap-2 text-2xl mt-1 select-none mr-2">
                        <span className="text-indigo-400 text-xs uppercase tracking-widest font-mono font-bold mr-1 block">Solve:</span>
                        <span className="text-white text-3xl font-mono font-bold">x =</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>{currentQuestion.num1}</span>
                      <span className="text-slate-400 select-none text-3xl">{currentQuestion.operandSymbol}</span>
                      <span>{currentQuestion.num2}</span>
                      <span className="text-slate-400 text-3xl mr-2">=</span>
                    </>
                  )}

                  {/* Typing display */}
                  <div className="min-w-20 min-h-12 border-b-2 border-dashed border-slate-700 flex items-center justify-center px-1 text-indigo-400 font-mono text-4xl relative">
                    {typedAnswer === '' ? (
                      <span className="text-slate-600 select-none opacity-50">?</span>
                    ) : (
                      <span className={shakeActive ? 'text-rose-400 font-bold' : 'text-indigo-400 font-bold'}>{typedAnswer}</span>
                    )}

                    {/* Blinking cursor */}
                    <span className="w-1 h-8 bg-indigo-400 ml-1 rounded animate-pulse" />
                  </div>
                </div>

                {/* Subtext info */}
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-4 font-semibold">
                  Type answer or use the touch pad below
                </span>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Virtual Keypad block */}
      <div className="relative z-10 pt-4 border-t border-slate-900/40">
        <Numpad
          onNumberClick={handleNumberClick}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSubmit={handleSubmit}
          onNegate={
            currentQuestion?.operation === 'subtraction' || currentQuestion?.operation === 'algebra'
              ? handleNegate
              : undefined
          }
          disabled={isPaused || timeLeft === 0 || !currentQuestion}
        />
      </div>
    </div>
  );
}
