import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
  showLabel = false,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2 select-none no-print ${className}`}>
      {showLabel && (
        <span className="text-xs font-medium text-neutral-400">
          {isDark ? 'Night Mode' : 'Day Mode'}
        </span>
      )}
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
        title={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
        className={`relative inline-flex items-center justify-between w-18 h-8.5 p-1 rounded-full border cursor-pointer overflow-hidden transition-colors duration-500 shadow-sm ${
          isDark
            ? 'bg-slate-900 border-slate-700 shadow-inner'
            : 'bg-gradient-to-r from-amber-100 to-sky-100 border-amber-300 shadow-amber-200/50'
        }`}
      >
        {/* Animated Background Sky / Stars for Night */}
        <AnimatePresence>
          {isDark ? (
            <motion.div
              key="night-sky"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-start pl-2"
            >
              <div className="flex gap-1 items-center opacity-60">
                <Sparkles className="w-2.5 h-2.5 text-blue-300 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-blue-200 animate-ping" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="day-sky"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-end pr-2"
            >
              <div className="w-3 h-3 rounded-full bg-amber-200/60 blur-[1px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Sun Indicator on Left */}
        <motion.div
          animate={{
            scale: isDark ? 0.7 : 1,
            opacity: isDark ? 0.35 : 1,
            rotate: isDark ? 90 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="z-10 flex items-center justify-center w-6 h-6 ml-0.5 text-amber-500"
        >
          <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
        </motion.div>

        {/* Night Moon Indicator on Right */}
        <motion.div
          animate={{
            scale: isDark ? 1 : 0.7,
            opacity: isDark ? 1 : 0.35,
            rotate: isDark ? 0 : -90,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="z-10 flex items-center justify-center w-6 h-6 mr-0.5 text-blue-300"
        >
          <Moon className="w-4 h-4 text-blue-300 fill-blue-400/20" />
        </motion.div>

        {/* Animated Sliding Pill Thumb */}
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          animate={{
            x: isDark ? 36 : 0,
            rotate: isDark ? 360 : 0,
          }}
          className={`absolute top-1 left-1 w-6.5 h-6.5 rounded-full flex items-center justify-center shadow-md z-20 ${
            isDark
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/40 ring-1 ring-blue-400/30'
              : 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900 shadow-amber-400/50 ring-1 ring-amber-300/60'
          }`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-white fill-white" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};
