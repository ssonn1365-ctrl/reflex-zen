import React from 'react';
import { motion } from 'motion/react';

interface StreakCounterProps {
  streak: number;
}

export const StreakCounter: React.FC<StreakCounterProps & { theme?: 'light' | 'dark' }> = ({ streak, theme }) => {
  const isDark = theme === 'dark';
  return (
    <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
        Chuỗi kỷ luật
      </h3>
      <div className="relative">
        <motion.span 
          key={streak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          {streak}
        </motion.span>
        <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Ngày</span>
      </div>
      
      <div className="mt-4 flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full ${i < (streak % 7 || (streak > 0 ? 7 : 0)) ? 'bg-emerald-500' : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`} 
          />
        ))}
      </div>
    </div>
  );
};
