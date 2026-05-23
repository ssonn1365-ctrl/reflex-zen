import React, { useState, useEffect } from 'react';
import { Check, Zap, AlertCircle } from 'lucide-react';
import { Habit, HabitStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getHarshMotivation } from '../lib/gemini';

interface HabitCardProps {
  habit: Habit;
  status: HabitStatus;
  onStatusChange: (status: HabitStatus) => void;
  theme: 'light' | 'dark';
}

// Simple local cache for motivation messages to ensure "0.1s" speed on repeat
const motivationCache: Record<string, string> = {};

export const HabitCard: React.FC<HabitCardProps> = ({ habit, status, onStatusChange, theme }) => {
  const [motivation, setMotivation] = useState<string>(motivationCache[habit.id] || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (status === 'none') {
      // If we have it in cache, use it immediately
      if (motivationCache[habit.id]) {
        setMotivation(motivationCache[habit.id]);
        return;
      }

      const fetchMotivation = async () => {
        setLoading(true);
        try {
          const msg = await getHarshMotivation(habit.name, status);
          if (isMounted) {
            setMotivation(msg);
            motivationCache[habit.id] = msg; // Cache it
          }
        } catch (e) {
          if (isMounted) setMotivation("Đừng có lười nữa. Làm ngay đi.");
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchMotivation();
    } else {
      setMotivation('');
    }
    return () => { isMounted = false; };
  }, [habit.id, habit.name, status]);

  const isDark = theme === 'dark';

  return (
    <motion.div 
      layout
      className={`group relative border rounded-2xl p-5 transition-all ${
        isDark 
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
          : 'bg-white border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-sm font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{habit.name}</h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{habit.category}</p>
        </div>
        <div className={`w-2 h-2 rounded-full transition-colors ${
          status === 'full' ? 'bg-emerald-500' : 
          status === 'min' ? 'bg-amber-500' : 
          isDark ? 'bg-slate-800' : 'bg-slate-100'
        }`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onStatusChange(status === 'full' ? 'none' : 'full')}
          className={`relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
            status === 'full' 
              ? (isDark ? 'bg-white border-white text-slate-900' : 'bg-slate-900 border-slate-900 text-white shadow-sm')
              : (isDark ? 'bg-slate-800 border-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-slate-50 border-slate-50 text-slate-400 hover:bg-slate-100')
          }`}
        >
          <Check size={16} className={`mb-1 ${status === 'full' ? 'opacity-100' : 'opacity-20'}`} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Tối đa</span>
        </button>

        <button
          onClick={() => onStatusChange(status === 'min' ? 'none' : 'min')}
          className={`relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
            status === 'min' 
              ? (isDark ? 'bg-white border-white text-slate-900' : 'bg-slate-900 border-slate-900 text-white shadow-sm')
              : (isDark ? 'bg-slate-800 border-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-slate-50 border-slate-50 text-slate-400 hover:bg-slate-100')
          }`}
        >
          <Zap size={16} className={`mb-1 ${status === 'min' ? 'opacity-100' : 'opacity-20'}`} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Tối thiểu</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {status === 'none' && (
          <motion.div
            key="motivation"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'}`}
          >
            <div className="flex gap-2 items-start">
              <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
              <p className={`text-[11px] font-medium leading-tight ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {loading && !motivation ? (
                  <span className="animate-pulse text-slate-500">Đang nhận lệnh từ Grok...</span>
                ) : (
                  <span className="italic">"{motivation || "Đang chờ sỉ nhục..."}"</span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
