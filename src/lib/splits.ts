import { SPLIT_BY_ID } from '@/data/splits';
import { weekdayOf } from './dates';
import type { Gender, Profile, Split, SplitDay } from './types';

const BY_DAYS: Record<number, string[]> = {
  1: ['fullbody-2'],
  2: ['fullbody-2'],
  3: ['fullbody-3', 'glutes-3', 'ppl-3'],
  4: ['upper-lower-4', 'glutes-4', 'fullbody-4'],
  5: ['ulppl-5', 'upper-lower-4', 'glutes-4'],
  6: ['ppl-6', 'ulppl-5'],
  7: ['ppl-6', 'ulppl-5'],
};

/** Suggested splits for a profile, best first. */
export function suggestSplits(p: Pick<Profile, 'days' | 'gender'>): Split[] {
  const n = Math.min(7, Math.max(1, p.days.length));
  const ids = [...BY_DAYS[n]];
  if (p.gender === 'female') {
    const i = ids.findIndex((id) => id.startsWith('glutes'));
    if (i > 0) ids.unshift(...ids.splice(i, 1));
  }
  return ids.map((id) => SPLIT_BY_ID[id]);
}

export function defaultSplitId(p: { days: number[]; gender: Gender }): string {
  return suggestSplits({ days: p.days as Profile['days'], gender: p.gender })[0].id;
}

export type TodayPlan =
  | { kind: 'train'; split: Split; dayIndex: number; day: SplitDay }
  | { kind: 'rest'; split: Split }
  | { kind: 'none' };

/** What the active split says to do today. The next day in rotation is used on any planned weekday. */
export function todayPlan(p: Profile, now = new Date()): TodayPlan {
  const split = p.activeSplitId ? SPLIT_BY_ID[p.activeSplitId] : null;
  if (!split) return { kind: 'none' };
  if (!p.days.includes(weekdayOf(now))) return { kind: 'rest', split };
  const dayIndex = p.splitDayIndex % split.days.length;
  return { kind: 'train', split, dayIndex, day: split.days[dayIndex] };
}
