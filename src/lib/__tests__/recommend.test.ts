import { EXERCISE_BY_ID, exercisesForGroup, isAvailable } from '@/data/catalog';
import { GROUPS } from '@/data/groups';
import { SPLITS } from '@/data/splits';
import { pickExercisesForDay, planExercise, schemeFor } from '../recommend';
import { suggestSplits, todayPlan } from '../splits';
import type { Profile, Workout } from '../types';

const gym = { location: 'gym' as const, equipment: [] };
const bareHome = { location: 'home' as const, equipment: [] };

describe('catalog', () => {
  it('every curated top pick exists in the dataset', () => {
    const missing = GROUPS.flatMap((g) => g.topPicks).filter((id) => !EXERCISE_BY_ID[id]);
    expect(missing).toEqual([]);
  });

  it('every group has exercises at the gym and for bodyweight-only home users (except calves & biceps, which need gear)', () => {
    for (const g of GROUPS) {
      expect(exercisesForGroup(g.id, gym).length).toBeGreaterThan(3);
      if (!['calves', 'biceps'].includes(g.id)) expect(exercisesForGroup(g.id, bareHome).length).toBeGreaterThan(0);
    }
  });

  it('home users without gear only see bodyweight moves, and no pull-ups without a bar', () => {
    const all = GROUPS.flatMap((g) => exercisesForGroup(g.id, bareHome)).map((x) => x.exercise);
    expect(all.every((e) => e.equipment === 'body only')).toBe(true);
    expect(isAvailable(EXERCISE_BY_ID.Pullups, bareHome)).toBe(false);
    expect(isAvailable(EXERCISE_BY_ID.Pullups, { location: 'home', equipment: ['pullupbar'] })).toBe(true);
  });

  it('top picks come first', () => {
    const list = exercisesForGroup('glutes', gym);
    expect(list[0].topPick).toBe(true);
    expect(list[0].exercise.id).toBe('Barbell_Hip_Thrust');
  });
});

describe('sets/reps scheme', () => {
  const compound = EXERCISE_BY_ID.Barbell_Squat;
  it('uses goal-based schemes', () => {
    expect(schemeFor(compound, 'strength', 'regular')).toEqual({ sets: 4, reps: 6, restSec: 150 });
    expect(schemeFor(compound, 'muscle', 'regular')).toEqual({ sets: 3, reps: 10, restSec: 90 });
  });
  it('eases beginners in', () => {
    expect(schemeFor(compound, 'strength', 'never')).toEqual({ sets: 3, reps: 8, restSec: 165 });
  });
});

describe('progressive overload', () => {
  const ctx = (history: Workout[]) => ({ goal: 'muscle' as const, experience: 'some' as const, unit: 'kg' as const, history });
  const past = (reps: number): Workout => ({
    id: 'w',
    title: 'x',
    source: { type: 'custom' },
    startedAt: 1,
    endedAt: 2,
    exercises: [{ exerciseId: 'Barbell_Squat', restSec: 90, sets: [{ reps, weight: 60, targetReps: 10, done: true }] }],
  });

  it('starts at 0 with no history', () => {
    expect(planExercise('Barbell_Squat', ctx([])).sets[0].weight).toBe(0);
  });
  it('adds 2.5kg when all reps were hit last time', () => {
    const p = planExercise('Barbell_Squat', ctx([past(10)]));
    expect(p.sets.every((s) => s.weight === 62.5)).toBe(true);
    expect(p.bumped).toBe(true);
  });
  it('repeats the weight when reps were missed', () => {
    const p = planExercise('Barbell_Squat', ctx([past(7)]));
    expect(p.sets[0].weight).toBe(60);
    expect(p.bumped).toBe(false);
  });
});

describe('splits', () => {
  it('suggests by number of days and puts the glute split first for women', () => {
    expect(suggestSplits({ days: [0, 2, 4], gender: 'male' })[0].id).toBe('fullbody-3');
    expect(suggestSplits({ days: [0, 2, 4], gender: 'female' })[0].id).toBe('glutes-3');
    expect(suggestSplits({ days: [0, 1, 3, 4, 5, 6], gender: 'other' })[0].id).toBe('ppl-6');
  });

  it('every split day yields a workout for gym and bare-home users with no duplicates', () => {
    for (const s of SPLITS)
      for (const d of s.days)
        for (const eq of [gym, bareHome]) {
          const ids = pickExercisesForDay(d.groups, eq);
          expect(ids.length).toBeGreaterThanOrEqual(2);
          expect(new Set(ids).size).toBe(ids.length);
        }
  });

  it('today plan follows planned weekdays and rotation', () => {
    const p = { days: [0, 2, 4], activeSplitId: 'fullbody-3', splitDayIndex: 4 } as unknown as Profile;
    const wed = new Date(2026, 10, 11);
    const tue = new Date(2026, 10, 10);
    const plan = todayPlan(p, wed);
    expect(plan.kind).toBe('train');
    if (plan.kind === 'train') expect(plan.dayIndex).toBe(1);
    expect(todayPlan(p, tue).kind).toBe('rest');
  });
});
