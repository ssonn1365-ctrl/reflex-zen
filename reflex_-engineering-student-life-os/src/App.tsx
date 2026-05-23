/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Habit, DailyLog, HabitStatus, UserState, getHanoiDate, Theme } from './types';
import { HabitCard } from './components/HabitCard';
import { AICoach } from './components/AICoach';
import { StreakCounter } from './components/StreakCounter';
import { Heatmap } from './components/Heatmap';
import { SystemIntegrity } from './components/SystemIntegrity';
import { LayoutGrid, Settings, ShieldCheck, Zap, Plus, X, Edit2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Học tập / Nghiên cứu sâu',
    fullVersion: '2 giờ tập trung cao độ chuyên ngành',
    minVersion: '15 phút ôn tập hoặc giải 1 bài toán',
    category: 'study'
  },
  {
    id: '2',
    name: 'Rèn luyện thể chất',
    fullVersion: 'Tập Gym đầy đủ (60-90 phút)',
    minVersion: '10 phút vận động hoặc 20 cái chống đẩy',
    category: 'gym'
  },
  {
    id: '3',
    name: 'Phát triển kỹ năng',
    fullVersion: '1 giờ học Code hoặc dự án kỹ thuật',
    minVersion: 'Đọc 1 bài báo kỹ thuật hoặc 5 phút Code',
    category: 'skill'
  },
  {
    id: '4',
    name: 'Bảo trì hệ thống',
    fullVersion: 'Lên kế hoạch mai + Review hôm nay',
    minVersion: 'Kiểm tra lịch trình ngày mai',
    category: 'work'
  }
];

export default function App() {
  const [state, setState] = useState<UserState>(() => {
    const saved = localStorage.getItem('reflex_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.settings) {
        parsed.settings = { harshMode: true, userName: 'Engineer', focusMode: false, theme: 'light' };
      }
      if (!parsed.settings.theme) {
        parsed.settings.theme = 'light';
      }
      return parsed;
    }
    return {
      habits: DEFAULT_HABITS,
      logs: [],
      currentStreak: 0,
      lastResetDate: null,
      settings: { harshMode: true, userName: 'Engineer', focusMode: false, theme: 'light' }
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const today = getHanoiDate();
  const currentLog = state.logs.find(l => l.date === today) || { date: today, completions: {} };

  useEffect(() => {
    localStorage.setItem('reflex_state', JSON.stringify(state));
  }, [state]);

  const integrityPercentage = Math.round(
    (state.habits.filter(h => currentLog.completions[h.id] && currentLog.completions[h.id] !== 'none').length / 
    state.habits.length) * 100
  ) || 0;

  const updateHabitStatus = (habitId: string, status: HabitStatus) => {
    const newLogs = [...state.logs];
    const logIndex = newLogs.findIndex(l => l.date === today);
    
    const updatedCompletions = {
      ...(logIndex >= 0 ? newLogs[logIndex].completions : {}),
      [habitId]: status
    };

    if (logIndex >= 0) {
      newLogs[logIndex] = { ...newLogs[logIndex], completions: updatedCompletions };
    } else {
      newLogs.push({ date: today, completions: updatedCompletions });
    }

    let streak = 0;
    const isTodayOnTrack = state.habits.every(h => updatedCompletions[h.id] && updatedCompletions[h.id] !== 'none');
    
    if (isTodayOnTrack) {
      streak = 1;
      let checkDate = new Date(today);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toISOString().split('T')[0];
        const log = newLogs.find(l => l.date === dateStr);
        const isOnTrack = log && state.habits.every(h => log.completions[h.id] && log.completions[h.id] !== 'none');
        if (isOnTrack) {
          streak++;
        } else {
          break;
        }
      }
    }

    setState(prev => ({
      ...prev,
      logs: newLogs,
      currentStreak: streak
    }));
  };

  const saveHabit = (habit: Habit) => {
    setState(prev => {
      const exists = prev.habits.find(h => h.id === habit.id);
      if (exists) {
        return { ...prev, habits: prev.habits.map(h => h.id === habit.id ? habit : h) };
      }
      return { ...prev, habits: [...prev.habits, habit] };
    });
    setEditingHabit(null);
  };

  const deleteHabit = (id: string) => {
    setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
  };

  const isDark = state.settings.theme === 'dark';

  return (
    <div className={`min-h-screen font-sans selection:bg-slate-100 pb-20 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <header className="max-w-md mx-auto px-6 py-12 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter uppercase">Reflex Zen</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Grok-Powered Discipline</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, theme: isDark ? 'light' : 'dark' } }))}
            className={`p-2 rounded-full transition-colors ${isDark ? 'text-amber-400 hover:bg-slate-900' : 'text-slate-300 hover:text-slate-900'}`}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, focusMode: !prev.settings.focusMode } }))}
            className={`p-2 rounded-full transition-colors ${state.settings.focusMode ? (isDark ? 'bg-white text-black' : 'bg-slate-900 text-white') : 'text-slate-300 hover:text-slate-900'}`}
            title="Focus Mode"
          >
            <Zap size={18} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 space-y-12">
        {/* Dashboard Overview */}
        <AnimatePresence mode="wait">
          {!state.settings.focusMode && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <SystemIntegrity percentage={integrityPercentage} theme={state.settings.theme} />
              <div className="grid grid-cols-2 gap-4">
                <StreakCounter streak={state.currentStreak} theme={state.settings.theme} />
                <Heatmap logs={state.logs} habits={state.habits} theme={state.settings.theme} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Core Reflexes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className={`font-black text-xs uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Phản xạ hôm nay ({today})
            </h2>
            {!state.settings.focusMode && (
              <button 
                onClick={() => setEditingHabit({ id: Date.now().toString(), name: '', fullVersion: '', minVersion: '', category: 'custom' })}
                className="text-slate-300 hover:text-slate-900 transition-colors"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="grid gap-6">
            {state.habits.map(habit => (
              <div key={habit.id} className="relative group">
                <HabitCard
                  habit={habit}
                  status={currentLog.completions[habit.id] || 'none'}
                  onStatusChange={(status) => updateHabitStatus(habit.id, status)}
                  theme={state.settings.theme}
                />
                {!state.settings.focusMode && (
                  <button 
                    onClick={() => setEditingHabit(habit)}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={12} className="text-slate-300" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* AI Coach */}
        <section>
          <AICoach 
            currentHabits={state.habits.map(h => ({ name: h.name, status: currentLog.completions[h.id] || 'none' }))}
            onReset={() => console.log("Resetting...")}
            theme={state.settings.theme}
          />
        </section>
      </main>

      {/* Habit Editor Modal */}
      <AnimatePresence>
        {editingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl uppercase tracking-tight">Cấu hình phản xạ</h3>
                <button onClick={() => setEditingHabit(null)}><X size={24} /></button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 block">Tên thói quen</label>
                  <input 
                    type="text" 
                    value={editingHabit.name}
                    onChange={e => setEditingHabit({...editingHabit, name: e.target.value})}
                    className={`w-full rounded-xl px-4 py-2 text-sm focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 block">Phiên bản đầy đủ</label>
                  <input 
                    type="text" 
                    value={editingHabit.fullVersion}
                    onChange={e => setEditingHabit({...editingHabit, fullVersion: e.target.value})}
                    className={`w-full rounded-xl px-4 py-2 text-sm focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 block">Phiên bản tối thiểu</label>
                  <input 
                    type="text" 
                    value={editingHabit.minVersion}
                    onChange={e => setEditingHabit({...editingHabit, minVersion: e.target.value})}
                    className={`w-full rounded-xl px-4 py-2 text-sm focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-900'}`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => deleteHabit(editingHabit.id)}
                  className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  Xóa
                </button>
                <button 
                  onClick={() => saveHabit(editingHabit)}
                  className={`flex-[2] py-3 rounded-2xl text-sm font-bold transition-colors ${isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  Lưu phản xạ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl uppercase tracking-tight">Cài đặt hệ thống</h3>
                <button onClick={() => setIsSettingsOpen(false)}><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">Chế độ khắt khe</div>
                    <div className="text-xs text-slate-500">AI sẽ sỉ nhục bạn nặng nề hơn</div>
                  </div>
                  <button 
                    onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, harshMode: !prev.settings.harshMode } }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.harshMode ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.settings.harshMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className={`w-full py-3 rounded-2xl text-sm font-bold ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


