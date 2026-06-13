import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playTick } from '../utils/audio';

interface NumpadProps {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onNegate?: () => void;
  disabled?: boolean;
}

export default function Numpad({
  onNumberClick,
  onBackspace,
  onClear,
  onSubmit,
  onNegate,
  disabled = false,
}: NumpadProps) {
  // Handle physical keyboard typing
  const handlePhysicalKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      const key = e.key;
      if (/[0-9]/.test(key)) {
        e.preventDefault();
        playTick();
        onNumberClick(key);
      } else if (key === 'Backspace') {
        e.preventDefault();
        playTick();
        onBackspace();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        playTick();
        onClear();
      } else if (key === 'Enter' || key === ' ' || key === '=') {
        e.preventDefault();
        playTick();
        onSubmit();
      } else if (key === '-' && onNegate) {
        e.preventDefault();
        playTick();
        onNegate();
      }
    },
    [onNumberClick, onBackspace, onClear, onSubmit, onNegate, disabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKey);
    return () => {
      window.removeEventListener('keydown', handlePhysicalKey);
    };
  }, [handlePhysicalKey]);

  const handleKeyTap = (action: () => void) => {
    if (disabled) return;
    playTick();
    action();
  };

  // Keyboard button list
  const buttons = [
    { value: '1', action: () => onNumberClick('1'), type: 'number' },
    { value: '2', action: () => onNumberClick('2'), type: 'number' },
    { value: '3', action: () => onNumberClick('3'), type: 'number' },
    { value: '4', action: () => onNumberClick('4'), type: 'number' },
    { value: '5', action: () => onNumberClick('5'), type: 'number' },
    { value: '6', action: () => onNumberClick('6'), type: 'number' },
    { value: '7', action: () => onNumberClick('7'), type: 'number' },
    { value: '8', action: () => onNumberClick('8'), type: 'number' },
    { value: '9', action: () => onNumberClick('9'), type: 'number' },
    { 
      value: '-', 
      action: onNegate ? onNegate : () => {}, 
      type: 'utility',
      disabled: !onNegate 
    },
    { value: '0', action: () => onNumberClick('0'), type: 'number' },
    { value: '⌫', action: onBackspace, type: 'backspace' },
  ];

  return (
    <div id="touch-numpad" className="w-full max-w-sm mx-auto select-none mt-2">
      {/* Grid Layout for numbers */}
      <div className="grid grid-cols-3 gap-3 p-1">
        <AnimatePresence>
          {buttons.map((btn, index) => {
            const isNumber = btn.type === 'number';
            const isNeg = btn.value === '-';
            const isBackspaceKey = btn.type === 'backspace';
            const isDisable = disabled || btn.disabled;

            return (
              <motion.button
                key={index}
                id={`numpad-key-${btn.value === '⌫' ? 'back' : btn.value}`}
                type="button"
                whileTap={{ scale: isDisable ? 1 : 0.94 }}
                whileHover={{ scale: isDisable ? 1 : 1.02 }}
                onClick={() => !isDisable && handleKeyTap(btn.action)}
                className={`
                  relative h-16 rounded-xl flex items-center justify-center font-medium text-2xl transition-all
                  outline-none focus:outline-none cursor-pointer border
                  ${isDisable ? 'opacity-25 cursor-not-allowed' : ''}
                  ${
                    isNumber
                      ? 'bg-slate-800/40 text-slate-100 hover:bg-slate-700/50 border-slate-700/50 shadow-sm font-sans'
                      : isNeg
                      ? 'bg-slate-800/10 text-slate-500 hover:text-slate-200 border-slate-800 hover:bg-slate-800/35 font-mono text-xl'
                      : 'bg-slate-800/20 text-slate-400 hover:text-rose-400 border-slate-800 hover:bg-rose-950/15'
                  }
                `}
                disabled={isDisable}
              >
                {btn.value}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Large Enter/OK & Clear keys span */}
        <div className="col-span-3 flex gap-3 mt-1">
          <motion.button
            id="numpad-key-clear"
            type="button"
            whileTap={{ scale: disabled ? 1 : 0.94 }}
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            onClick={() => handleKeyTap(onClear)}
            className="flex-1 h-16 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 text-slate-500 hover:text-rose-400 font-medium text-sm border border-slate-800 flex items-center justify-center cursor-pointer transition-all"
            disabled={disabled}
          >
            Clear (Esc)
          </motion.button>

          <motion.button
            id="numpad-key-submit"
            type="button"
            whileTap={{ scale: disabled ? 1 : 0.94 }}
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            onClick={() => handleKeyTap(onSubmit)}
            className="flex-2 h-16 rounded-xl bg-indigo-600/20 hover:bg-indigo-500/30 text-indigo-400 font-bold text-base shadow-lg shadow-indigo-500/5 border border-indigo-500/50 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
            disabled={disabled}
          >
            <span>ENTER</span>
            <span className="text-xs bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono font-medium">↵</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
