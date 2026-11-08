import { GROUP_BY_ID } from '@/data/groups';
import { SPLIT_BY_ID } from '@/data/splits';
import { pickExercisesForDay, planExercise } from './recommend';
import type { DraftWorkout, GroupId, Profile, Workout } from './types';

const ctxOf = (p: Profile, history: Workout[]) => ({
  goal: p.goal,
  experience: p.experience,
  unit: p.unit,
  history,
});

export function splitDayDraft(p: Profile, history: Workout[], splitId: string, dayIndex: number): DraftWorkout {
  const split = SPLIT_BY_ID[splitId];
  const day = split.days[dayIndex];
  const ids = pickExercisesForDay(day.groups, { location: p.location, equipment: p.equipment });
  return {
    title: day.name,
    source: { type: 'split', id: splitId, dayIndex },
    exercises: ids.map((id) => planExercise(id, ctxOf(p, history))),
  };
}

export function muscleDraft(p: Profile, history: Workout[], groupId: GroupId, exerciseIds: string[]): DraftWorkout {
  return {
    title: GROUP_BY_ID[groupId].name,
    source: { type: 'muscle', id: groupId },
    exercises: exerciseIds.map((id) => planExercise(id, ctxOf(p, history))),
  };
}

export function plannedFor(p: Profile, history: Workout[], exerciseIds: string[]) {
  return exerciseIds.map((id) => planExercise(id, ctxOf(p, history)));
}
