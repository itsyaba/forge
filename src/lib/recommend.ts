import { EXERCISE_BY_ID, exercisesForGroup, isBodyweight, type EquipmentContext } from '@/data/catalog';
import { GROUP_BY_ID } from '@/data/groups';
import type {
  Experience,
  Exercise,
  Goal,
  GroupId,
  PlannedExercise,
  Unit,
  Workout,
} from './types';

type Scheme = { sets: number; reps: number; restSec: number };

const SCHEMES: Record<Goal, { compound: Scheme; isolation: Scheme }> = {
  muscle: { compound: { sets: 3, reps: 10, restSec: 90 }, isolation: { sets: 3, reps: 12, restSec: 60 } },
  strength: { compound: { sets: 4, reps: 6, restSec: 150 }, isolation: { sets: 3, reps: 10, restSec: 90 } },
  fatloss: { compound: { sets: 3, reps: 12, restSec: 60 }, isolation: { sets: 3, reps: 15, restSec: 45 } },
  general: { compound: { sets: 3, reps: 10, restSec: 75 }, isolation: { sets: 3, reps: 12, restSec: 60 } },
};

export function schemeFor(ex: Exercise, goal: Goal, experience: Experience): Scheme {
  const base = SCHEMES[goal][ex.mechanic === 'isolation' ? 'isolation' : 'compound'];
  if (experience !== 'never') return { ...base };
  return { sets: Math.min(base.sets, 3), reps: base.reps + 2, restSec: base.restSec + 15 };
}

export const WEIGHT_STEP: Record<Unit, number> = { kg: 2.5, lb: 5 };

export type LastPerformance = { weight: number; hitAllReps: boolean };

/** Most recent logged performance of an exercise (completed sets only). */
export function lastPerformance(history: Workout[], exerciseId: string): LastPerformance | null {
  let latest: Workout | null = null;
  for (const w of history) {
    if (latest && w.endedAt <= latest.endedAt) continue;
    if (w.exercises.some((e) => e.exerciseId === exerciseId && e.sets.some((s) => s.done))) {
      latest = w;
    }
  }
  if (!latest) return null;
  const sets = latest.exercises
    .filter((e) => e.exerciseId === exerciseId)
    .flatMap((e) => e.sets)
    .filter((s) => s.done);
  return {
    weight: Math.max(...sets.map((s) => s.weight)),
    hitAllReps: sets.every((s) => s.reps >= s.targetReps),
  };
}

export type PlanContext = {
  goal: Goal;
  experience: Experience;
  unit: Unit;
  history: Workout[];
};

export function planExercise(exerciseId: string, ctx: PlanContext): PlannedExercise {
  const ex = EXERCISE_BY_ID[exerciseId];
  const scheme = schemeFor(ex, ctx.goal, ctx.experience);
  let weight = 0;
  let bumped = false;
  if (!isBodyweight(ex)) {
    const last = lastPerformance(ctx.history, exerciseId);
    if (last) {
      weight = last.weight;
      if (last.hitAllReps && last.weight > 0) {
        weight = last.weight + WEIGHT_STEP[ctx.unit];
        bumped = true;
      }
    }
  }
  return {
    exerciseId,
    restSec: scheme.restSec,
    sets: Array.from({ length: scheme.sets }, () => ({ reps: scheme.reps, weight })),
    bumped,
  };
}

/** Pick exercises for a split day: 2 per big group, 1 per small, compound first, no repeats. */
export function pickExercisesForDay(groups: GroupId[], equip: EquipmentContext): string[] {
  const chosen: string[] = [];
  for (const gid of groups) {
    const want = GROUP_BY_ID[gid].big ? 2 : 1;
    const picks = exercisesForGroup(gid, equip)
      .filter((g) => g.topPick && !chosen.includes(g.exercise.id))
      .map((g) => g.exercise);
    const ordered = [
      ...picks.filter((e) => e.mechanic === 'compound'),
      ...picks.filter((e) => e.mechanic !== 'compound'),
    ];
    for (const e of ordered.slice(0, want)) chosen.push(e.id);
  }
  // compound moves first in the workout
  return chosen.sort((a, b) => rank(a) - rank(b));
}

const rank = (id: string) => (EXERCISE_BY_ID[id].mechanic === 'compound' ? 0 : 1);
