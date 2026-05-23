import React from 'react';
import { motion } from 'motion/react';
import { DailyLog, Habit } from '../types';

interface HeatmapProps {
  logs: DailyLog[];
  habits: Habit[];
}

export const Heatmap: React.FC<HeatmapProps & { theme?: 'light' | 'dark' }> = ({ logs, habits, theme }) => {
  const isDark = theme === 'dark';
  const days = 28; // 4 weeks for better symmetry
  const today = new Date();
  const dates = Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (days - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const getIntensity = (date: string) => {
    const log = logs.find(l => l.date === date);
    if (!log) return 0;
    
    const completedCount = habits.filter(h => {
      const status = log.completions[h.id];
      return status === 'full' || status === 'min';
    }).length;

    if (completedCount === 0) return 0;
    if (completedCount < habits.length) return 1; // Partial
    return 2; // Full
  };

  return (
    <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
        Lịch sử 28 ngày
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, i) => {
          const intensity = getIntensity(date);
          return (
            <motion.div
              key={date}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`w-3 h-3 rounded-[2px] ${
                intensity === 2 ? (isDark ? 'bg-white' : 'bg-slate-900') :
                intensity === 1 ? (isDark ? 'bg-slate-600' : 'bg-slate-300') :
                (isDark ? 'bg-slate-800' : 'bg-slate-50')
              }`}
              title={date}
            />
          );
        })}
      </div>
    </div>
  );
};
