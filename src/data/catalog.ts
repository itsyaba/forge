import type { Exercise, GroupId, HomeEquipment, Location } from '@/lib/types';
import raw from './exercises.json';
import { GROUP_BY_ID, GROUPS } from './groups';

export const EXERCISES = raw as Exercise[];
export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
);

// jsDelivr is a real CDN in front of the GitHub repo; raw.githubusercontent is the fallback.
const IMAGE_BASES = [
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/',
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/',
] as const;
export const IMAGE_MIRRORS = IMAGE_BASES.length;
export const imageUrl = (path: string, mirror = 0) => IMAGE_BASES[Math.min(mirror, IMAGE_BASES.length - 1)] + path;

/** Body-only moves that still need a bar or parallel bars. */
const NEEDS_BAR = new Set([
  'Pullups',
  'Chin-Up',
  'V-Bar_Pullup',
  'Wide-Grip_Rear_Pull-Up',
  'Scapular_Pull-Up',
  'Dips_-_Triceps_Version',
  'Inverted_Row',
]);

const HOME_EQUIPMENT: Record<HomeEquipment, string[]> = {
  dumbbells: ['dumbbell'],
  bands: ['bands'],
  kettlebell: ['kettlebells'],
  pullupbar: [],
};

const GYM_EXCLUDED = new Set(['other']);

export type EquipmentContext = { location: Location; equipment: HomeEquipment[] };

const TOP_PICK_IDS = new Set(GROUPS.flatMap((g) => g.topPicks));

export function isAvailable(ex: Exercise, ctx: EquipmentContext): boolean {
  if (ctx.location === 'gym') {
    return !GYM_EXCLUDED.has(ex.equipment) || TOP_PICK_IDS.has(ex.id);
  }
  if (ex.equipment === 'body only') {
    return !NEEDS_BAR.has(ex.id) || ctx.equipment.includes('pullupbar');
  }
  return ctx.equipment.some((h) => HOME_EQUIPMENT[h].includes(ex.equipment));
}

export function isBodyweight(ex: Exercise): boolean {
  return ex.equipment === 'body only';
}

function inGroup(ex: Exercise, groupId: GroupId): boolean {
  const g = GROUP_BY_ID[groupId];
  if (ex.primary.some((m) => g.muscles.includes(m))) return true;
  if (g.topPicks.includes(ex.id)) return true;
  return (
    !!g.secondaryCompound &&
    ex.mechanic === 'compound' &&
    ex.secondary.some((m) => g.secondaryCompound!.includes(m)) &&
    ex.primary.some((m) => m === 'quadriceps' || m === 'hamstrings')
  );
}

export type GroupExercise = { exercise: Exercise; topPick: boolean };

/** Exercises for a muscle group the user can do, top picks first. */
export function exercisesForGroup(groupId: GroupId, ctx: EquipmentContext): GroupExercise[] {
  const g = GROUP_BY_ID[groupId];
  const picks = g.topPicks
    .map((id) => EXERCISE_BY_ID[id])
    .filter((e): e is Exercise => !!e && isAvailable(e, ctx));
  const pickIds = new Set(picks.map((e) => e.id));
  const rest = EXERCISES.filter(
    (e) => !pickIds.has(e.id) && inGroup(e, groupId) && isAvailable(e, ctx),
  ).sort((a, b) => {
    if (a.level !== b.level) return a.level === 'beginner' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return [
    ...picks.map((exercise) => ({ exercise, topPick: true })),
    ...rest.map((exercise) => ({ exercise, topPick: false })),
  ];
}
