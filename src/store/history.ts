import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dayKey } from '@/lib/dates';
import type { BodyWeightEntry, Workout } from '@/lib/types';
import { kvStorage } from './storage';

type HistoryState = {
  workouts: Workout[];
  bodyWeights: BodyWeightEntry[];
  addWorkout: (w: Workout) => void;
  deleteWorkout: (id: string) => void;
  logBodyWeight: (weight: number, at?: Date) => void;
  reset: () => void;
};

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      workouts: [],
      bodyWeights: [],
      addWorkout: (w) => set((s) => ({ workouts: [w, ...s.workouts] })),
      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),
      logBodyWeight: (weight, at = new Date()) =>
        set((s) => {
          const date = dayKey(at);
          const rest = s.bodyWeights.filter((b) => b.date !== date);
          return { bodyWeights: [...rest, { date, weight }].sort((a, b) => a.date.localeCompare(b.date)) };
        }),
      reset: () => set({ workouts: [], bodyWeights: [] }),
    }),
    { name: 'forge.history', storage: kvStorage, version: 1 },
  ),
);
