export type HabitStatus = 'none' | 'min' | 'full';
export type Theme = 'light' | 'dark';

export interface Habit {
  id: string;
  name: string;
  fullVersion: string;
  minVersion: string;
  category: 'study' | 'work' | 'gym' | 'skill' | 'custom';
}

export interface DailyLog {
  date: string; // ISO date YYYY-MM-DD
  completions: Record<string, HabitStatus>;
}

export interface UserState {
  habits: Habit[];
  logs: DailyLog[];
  currentStreak: number;
  lastResetDate: string | null;
  settings: {
    harshMode: boolean;
    userName: string;
    focusMode: boolean;
    theme: Theme;
  };
}

export interface AIResponse {
  analysis: string;
  nextAction: string;
}

export const getHanoiDate = () => {
  const now = new Date();
  const hanoiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return hanoiTime.toISOString().split('T')[0];
};
