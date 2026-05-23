import React from 'react';
import { motion } from 'motion/react';

interface SystemIntegrityProps {
  percentage: number;
}

export const SystemIntegrity: React.FC<SystemIntegrityProps & { theme?: 'light' | 'dark' }> = ({ percentage, theme }) => {
  const isDark = theme === 'dark';
  const isCritical = percentage < 50;
  const isStable = percentage === 100;

  return (
    <div className={`rounded-2xl p-6 border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
            Chỉ số vận hành
          </h3>
          <div className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {percentage}%
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
            isStable ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : 
            isCritical ? (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600') : 
            (isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600')
          }`}>
            {isStable ? 'Tối ưu' : isCritical ? 'Nguy cấp' : 'Ổn định'}
          </div>
        </div>
      </div>
      
      <div className={`mt-6 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className={`h-full transition-colors duration-500 ${
            isCritical ? 'bg-red-500' : isStable ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
      </div>
    </div>
  );
};
