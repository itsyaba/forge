import { router } from 'expo-router';
import { success } from '@/components/ui';
import type { Workout } from '@/lib/types';
import { useHistory } from './history';
import { useProfile } from './profile';

/** Save a finished workout, advance the split rotation, and show the summary. */
export function saveFinished(w: Workout | null) {
  if (!w) {
    router.replace('/');
    return;
  }
  useHistory.getState().addWorkout(w);
  const p = useProfile.getState().profile;
  if (w.source.type === 'split' && p?.activeSplitId === w.source.id) {
    useProfile.getState().advanceSplitDay();
  }
  success();
  router.replace(`/summary/${w.id}`);
}

