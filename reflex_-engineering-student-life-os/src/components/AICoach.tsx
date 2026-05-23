import React, { useState } from 'react';
import { Brain, RefreshCcw, Send } from 'lucide-react';
import { analyzeFailure } from '../lib/gemini';
import { AIResponse, HabitStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AICoachProps {
  currentHabits: { name: string; status: HabitStatus }[];
  onReset: () => void;
}

export const AICoach: React.FC<AICoachProps & { theme: 'light' | 'dark' }> = ({ currentHabits, onReset, theme }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const handleAnalyze = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    
    // Ensure response takes at least 2s for "impact" but not more than 5s
    const startTime = Date.now();
    const result = await analyzeFailure(reason, currentHabits);
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    
    if (elapsed < 2000) {
      await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
    }
    
    setResponse(result);
    setLoading(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl p-6 border transition-all ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-center gap-2 mb-6">
        <Brain size={18} className={isDark ? 'text-white' : 'text-slate-900'} />
        <h2 className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>Reflex Coach v3.0 (Grok Mode)</h2>
      </div>

      {!response ? (
        <div className="space-y-4">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Tại sao bạn chưa bắt đầu?
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập rào cản..."
              className={`flex-1 border rounded-xl px-4 py-3 text-sm transition-all placeholder:text-slate-300 focus:outline-none ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-white' 
                  : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-slate-900'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !reason.trim()}
              className={`disabled:opacity-20 px-5 rounded-xl transition-all ${
                isDark 
                  ? 'bg-white text-slate-900 hover:bg-slate-100' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chẩn đoán</div>
              <p className={`text-sm leading-relaxed italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>"{response.analysis}"</p>
            </div>

            <div className={`p-5 rounded-2xl ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
              <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lệnh Reset</div>
              <p className="text-lg font-bold tracking-tight mb-4">{response.nextAction}</p>
              
              <button
                onClick={() => {
                  setResponse(null);
                  setReason('');
                  onReset();
                }}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isDark ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                Chấp hành
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
