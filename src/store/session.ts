import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveWorkout, DraftWorkout, PlannedExercise, Workout } from '@/lib/types';
import { kvStorage, uid } from './storage';

type SessionState = {
  draft: DraftWorkout | null;
  active: ActiveWorkout | null;

  setDraft: (d: DraftWorkout | null) => void;
  updateDraftExercise: (index: number, fn: (e: PlannedExercise) => PlannedExercise) => void;
  removeDraftExercise: (index: number) => void;
  appendDraftExercises: (exs: PlannedExercise[]) => void;

  startWorkout: () => void;
  setCurrentSet: (patch: { reps?: number; weight?: number }) => void;
  completeSet: (now?: number) => void;
  addRest: (sec: number) => void;
  skipRest: () => void;
  skipExercise: () => void;
  /** Ends the active workout. Returns the saved workout, or null if no sets were done. */
  finish: (now?: number) => Workout | null;
  discard: () => void;
};

export const isFinished = (a: ActiveWorkout) => a.cursor.ex >= a.exercises.length;

function nextCursor(a: ActiveWorkout, from: { ex: number; set: number }) {
  let { ex, set } = from;
  set++;
  while (ex < a.exercises.length && set >= a.exercises[ex].sets.length) {
    ex++;
    set = 0;
  }
  return { ex, set };
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      draft: null,
      active: null,

      setDraft: (draft) => set({ draft }),
      updateDraftExercise: (index, fn) =>
        set((s) =>
          s.draft
            ? { draft: { ...s.draft, exercises: s.draft.exercises.map((e, i) => (i === index ? fn(e) : e)) } }
            : s,
        ),
      removeDraftExercise: (index) =>
        set((s) =>
          s.draft ? { draft: { ...s.draft, exercises: s.draft.exercises.filter((_, i) => i !== index) } } : s,
        ),
      appendDraftExercises: (exs) =>
        set((s) => {
          if (!s.draft) return { draft: { title: 'Custom', source: { type: 'custom' }, exercises: exs } };
          const have = new Set(s.draft.exercises.map((e) => e.exerciseId));
          return {
            draft: { ...s.draft, exercises: [...s.draft.exercises, ...exs.filter((e) => !have.has(e.exerciseId))] },
          };
        }),

      startWorkout: () => {
        const d = get().draft;
        if (!d || !d.exercises.length) return;
        set({
          active: {
            id: uid(),
            title: d.title,
            source: d.source,
            startedAt: Date.now(),
            restEndsAt: null,
            cursor: { ex: 0, set: 0 },
            exercises: d.exercises
              .filter((e) => e.sets.length)
              .map((e) => ({
                exerciseId: e.exerciseId,
                restSec: e.restSec,
                sets: e.sets.map((s) => ({ reps: s.reps, weight: s.weight, targetReps: s.reps, done: false })),
              })),
          },
          draft: null,
        });
      },

      setCurrentSet: (patch) =>
        set((s) => {
          const a = s.active;
          if (!a || isFinished(a)) return s;
          const { ex, set: si } = a.cursor;
          const exercises = a.exercises.map((e, i) =>
            i !== ex
              ? e
              : {
                  ...e,
                  // weight changes carry forward to remaining sets
                  sets: e.sets.map((st, j) =>
                    j === si
                      ? { ...st, ...patch }
                      : j > si && patch.weight !== undefined && !st.done
                        ? { ...st, weight: patch.weight }
                        : st,
                  ),
                },
          );
          return { active: { ...a, exercises } };
        }),

      completeSet: (now = Date.now()) =>
        set((s) => {
          const a = s.active;
          if (!a || isFinished(a)) return s;
          const { ex, set: si } = a.cursor;
          const exercises = a.exercises.map((e, i) =>
            i !== ex
              ? e
              : { ...e, sets: e.sets.map((st, j) => (j === si ? { ...st, done: true, completedAt: now } : st)) },
          );
          const updated = { ...a, exercises };
          const cursor = nextCursor(updated, a.cursor);
          const done = cursor.ex >= exercises.length;
          return {
            active: { ...updated, cursor, restEndsAt: done ? null : now + a.exercises[ex].restSec * 1000 },
          };
        }),

      addRest: (sec) =>
        set((s) => (s.active?.restEndsAt ? { active: { ...s.active, restEndsAt: s.active.restEndsAt + sec * 1000 } } : s)),
      skipRest: () => set((s) => (s.active ? { active: { ...s.active, restEndsAt: null } } : s)),
      skipExercise: () =>
        set((s) => {
          const a = s.active;
          if (!a || isFinished(a)) return s;
          return { active: { ...a, cursor: { ex: a.cursor.ex + 1, set: 0 }, restEndsAt: null } };
        }),

      finish: (now = Date.now()) => {
        const a = get().active;
        if (!a) return null;
        const exercises = a.exercises
          .map((e) => ({ ...e, sets: e.sets.filter((st) => st.done) }))
          .filter((e) => e.sets.length);
        set({ active: null });
        if (!exercises.length) return null;
        return { id: a.id, title: a.title, source: a.source, startedAt: a.startedAt, endedAt: now, exercises };
      },
      discard: () => set({ active: null }),
    }),
    { name: 'forge.session', storage: kvStorage, version: 1 },
  ),
);
