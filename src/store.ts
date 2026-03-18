import { create } from 'zustand';
import type { UserPreferences, TravelMood } from './types';

// ── Auth Store ────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
}));

// ── Theme Store ───────────────────────────────────────────────────────────────

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    return { theme: next };
  }),
  setTheme: (t) => {
    localStorage.setItem('theme', t);
    set({ theme: t });
  },
}));

// ── Preferences Store ─────────────────────────────────────────────────────────

interface PreferencesState {
  preferences: UserPreferences;
  setPreferences: (p: Partial<UserPreferences>) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: {
    defaultMood: 'chill' as TravelMood,
    budgetStyle: 'moderate',
    dietaryPref: [],
    interests: [],
    carbonConscious: false,
    theme: 'dark',
  },
  setPreferences: (p) => set((s) => ({ preferences: { ...s.preferences, ...p } })),
}));
