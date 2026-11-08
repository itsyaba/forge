import { addDays, startOfWeek } from '../dates';
import { estimateCalories, exerciseSeries, personalRecords, weeklyStreak, workoutVolume } from '../stats';
import type { Workout } from '../types';

// Wed 2026-11-11, local time
const NOW = new Date(2026, 10, 11, 18, 0);
const monday = startOfWeek(NOW);
const at = (weeksAgo: number, day = 0) => addDays(monday, -7 * weeksAgo + day).getTime() + 10 * 3600_000;

describe('weeklyStreak', () => {
  it('counts consecutive past weeks that hit the target', () => {
    const ws = [at(1, 0), at(1, 2), at(2, 0), at(2, 3), at(4, 0), at(4, 1)].map((startedAt) => ({ startedAt }));
    const s = weeklyStreak(ws, 2, NOW);
    expect(s.current).toBe(2); // last week + the week before; 3 weeks ago missed
    expect(s.best).toBe(2);
    expect(s.thisWeek).toBe(0);
  });

  it('includes the current week only once the target is hit', () => {
    const ws = [at(0, 0), at(0, 1), at(1, 0), at(1, 1)].map((startedAt) => ({ startedAt }));
    expect(weeklyStreak(ws, 2, NOW).current).toBe(2);
    expect(weeklyStreak(ws.slice(1), 2, NOW).current).toBe(1); // this week in progress (1/2) does not break it
  });

  it('is zero with no workouts', () => {
    expect(weeklyStreak([], 3, NOW)).toEqual({ current: 0, best: 0, thisWeek: 0 });
  });

  it('remembers a longer best streak from the past', () => {
    const ws = [at(6), at(5), at(4), at(1)].map((startedAt) => ({ startedAt }));
    const s = weeklyStreak(ws, 1, NOW);
    expect(s.current).toBe(1);
    expect(s.best).toBe(3);
  });
});

const workout = (id: string, startedAt: number, weight: number, reps = 10): Workout => ({
  id,
  title: 'T',
  source: { type: 'custom' },
  startedAt,
  endedAt: startedAt + 3600_000,
  exercises: [
    {
      exerciseId: 'Barbell_Hip_Thrust',
      restSec: 90,
      sets: [
        { reps, weight, targetReps: 10, done: true },
        { reps, weight, targetReps: 10, done: true },
      ],
    },
  ],
});

describe('volume, series and PRs', () => {
  it('computes volume from done sets', () => {
    expect(workoutVolume(workout('a', 0, 50))).toBe(1000);
  });

  it('builds an oldest-first series of best weights', () => {
    const ws = [workout('b', 2000, 60), workout('a', 1000, 50)];
    expect(exerciseSeries(ws, 'Barbell_Hip_Thrust').map((p) => p.best)).toEqual([50, 60]);
  });

  it('flags a PR only when beating an earlier best', () => {
    const a = workout('a', 1000, 50);
    const b = workout('b', 2000, 60);
    const c = workout('c', 3000, 55);
    const all = [a, b, c];
    expect(personalRecords(a, all)).toEqual([]); // first time is not a PR
    expect(personalRecords(b, all)).toEqual(['Barbell_Hip_Thrust']);
    expect(personalRecords(c, all)).toEqual([]);
  });

  it('estimates calories', () => {
    expect(estimateCalories(3600_000, 80, 'kg')).toBe(400);
  });
});
