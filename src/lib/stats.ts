import { addDays, dayKey, startOfWeek, weekKey } from './dates';
import type { LoggedExercise, Workout } from './types';

export const doneSets = (exs: LoggedExercise[]) => exs.flatMap((e) => e.sets.filter((s) => s.done));

export function workoutVolume(w: { exercises: LoggedExercise[] }): number {
  return doneSets(w.exercises).reduce((sum, s) => sum + s.reps * s.weight, 0);
}

export function setCount(w: { exercises: LoggedExercise[] }): number {
  return doneSets(w.exercises).length;
}

/**
 * Weekly streak: consecutive weeks (Mon–Sun) with at least `target` workouts.
 * The current week only counts once it hits the target; it never breaks the streak while in progress.
 */
export function weeklyStreak(
  workouts: Pick<Workout, 'startedAt'>[],
  target: number,
  now = new Date(),
): { current: number; best: number; thisWeek: number } {
  const goal = Math.max(1, target);
  const perWeek = new Map<string, number>();
  for (const w of workouts) {
    const k = weekKey(w.startedAt);
    perWeek.set(k, (perWeek.get(k) ?? 0) + 1);
  }
  const thisWeekStart = startOfWeek(now);
  const thisWeek = perWeek.get(dayKey(thisWeekStart)) ?? 0;

  let current = thisWeek >= goal ? 1 : 0;
  for (let wk = addDays(thisWeekStart, -7); (perWeek.get(dayKey(wk)) ?? 0) >= goal; wk = addDays(wk, -7)) {
    current++;
  }

  // best: scan from the earliest week to now
  let best = current;
  if (workouts.length) {
    const first = startOfWeek(new Date(Math.min(...workouts.map((w) => w.startedAt))));
    let run = 0;
    for (let wk = first; wk <= thisWeekStart; wk = addDays(wk, 7)) {
      if ((perWeek.get(dayKey(wk)) ?? 0) >= goal) best = Math.max(best, ++run);
      else if (wk < thisWeekStart) run = 0;
    }
  }
  return { current, best, thisWeek };
}

/** Set of YYYY-MM-DD days that had a workout */
export function workoutDays(workouts: Pick<Workout, 'startedAt'>[]): Set<string> {
  return new Set(workouts.map((w) => dayKey(w.startedAt)));
}

export type ExercisePoint = { at: number; best: number; volume: number };

/** Best weight (and volume) per session for one exercise, oldest first. */
export function exerciseSeries(workouts: Workout[], exerciseId: string): ExercisePoint[] {
  return workouts
    .map((w) => {
      const sets = doneSets(w.exercises.filter((e) => e.exerciseId === exerciseId));
      if (!sets.length) return null;
      return {
        at: w.startedAt,
        best: Math.max(...sets.map((s) => s.weight)),
        volume: sets.reduce((a, s) => a + s.reps * s.weight, 0),
      };
    })
    .filter((p): p is ExercisePoint => !!p)
    .sort((a, b) => a.at - b.at);
}

/** Exercise ids where this workout set a new best weight compared to earlier workouts. */
export function personalRecords(workout: Workout, history: Workout[]): string[] {
  const earlier = history.filter((w) => w.id !== workout.id && w.startedAt < workout.startedAt);
  const prs: string[] = [];
  for (const e of workout.exercises) {
    const sets = e.sets.filter((s) => s.done && s.weight > 0);
    if (!sets.length) continue;
    const best = Math.max(...sets.map((s) => s.weight));
    const prev = exerciseSeries(earlier, e.exerciseId);
    if (prev.length && best > Math.max(...prev.map((p) => p.best)) && !prs.includes(e.exerciseId)) {
      prs.push(e.exerciseId);
    }
  }
  return prs;
}

/** Rough calories: MET 5 (moderate weight training) × kg × hours. */
export function estimateCalories(durationMs: number, bodyWeight: number, unit: 'kg' | 'lb'): number {
  const kg = unit === 'kg' ? bodyWeight : bodyWeight * 0.4536;
  return Math.round(5 * kg * (durationMs / 3_600_000));
}

/** Exercise ids the user has logged, most recent first. */
export function loggedExerciseIds(workouts: Workout[]): string[] {
  const seen = new Map<string, number>();
  for (const w of workouts) {
    for (const e of w.exercises) {
      if (e.sets.some((s) => s.done)) seen.set(e.exerciseId, Math.max(seen.get(e.exerciseId) ?? 0, w.startedAt));
    }
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/** The most recent workout logged on the same calendar day as `now`, if any. */
export function workoutOnDay<W extends Pick<Workout, 'startedAt'>>(workouts: W[], now: number = Date.now()): W | undefined {
  const key = dayKey(now);
  return workouts.find((w) => dayKey(w.startedAt) === key);
}
