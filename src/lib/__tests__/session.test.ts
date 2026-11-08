import { isFinished, useSession } from '@/store/session';

// jest hoists this mock above the import
jest.mock('expo-sqlite/kv-store', () => {
  const mem = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (k: string) => mem.get(k) ?? null,
      setItem: async (k: string, v: string) => void mem.set(k, v),
      removeItem: async (k: string) => void mem.delete(k),
    },
  };
});

const draft = {
  title: 'Glutes',
  source: { type: 'muscle' as const, id: 'glutes' as const },
  exercises: [
    { exerciseId: 'Barbell_Hip_Thrust', restSec: 90, sets: [{ reps: 10, weight: 40 }, { reps: 10, weight: 40 }] },
    { exerciseId: 'Butt_Lift_Bridge', restSec: 60, sets: [{ reps: 12, weight: 0 }] },
  ],
};

beforeEach(() => useSession.setState({ draft: null, active: null }));

describe('session flow', () => {
  it('runs a workout from draft to finish', () => {
    const s = useSession.getState();
    s.setDraft(draft);
    s.startWorkout();
    expect(useSession.getState().draft).toBeNull();

    s.setCurrentSet({ weight: 45 });
    // weight carries forward to the next set of the same exercise
    expect(useSession.getState().active!.exercises[0].sets[1].weight).toBe(45);

    s.completeSet(1000);
    let a = useSession.getState().active!;
    expect(a.cursor).toEqual({ ex: 0, set: 1 });
    expect(a.restEndsAt).toBe(1000 + 90_000);

    s.addRest(15);
    expect(useSession.getState().active!.restEndsAt).toBe(1000 + 105_000);
    s.skipRest();

    s.setCurrentSet({ reps: 8 });
    s.completeSet(2000);
    a = useSession.getState().active!;
    expect(a.cursor).toEqual({ ex: 1, set: 0 });

    s.completeSet(3000);
    a = useSession.getState().active!;
    expect(isFinished(a)).toBe(true);
    expect(a.restEndsAt).toBeNull(); // no rest after the last set

    const w = s.finish(4000)!;
    expect(w.exercises).toHaveLength(2);
    expect(w.exercises[0].sets.map((x) => [x.reps, x.weight, x.targetReps])).toEqual([
      [10, 45, 10],
      [8, 45, 10],
    ]);
    expect(useSession.getState().active).toBeNull();
  });

  it('skipping drops undone sets and finishing with nothing returns null', () => {
    const s = useSession.getState();
    s.setDraft(draft);
    s.startWorkout();
    s.skipExercise();
    expect(useSession.getState().active!.cursor).toEqual({ ex: 1, set: 0 });
    expect(s.finish()).toBeNull();
  });

  it('appending to a draft ignores duplicates', () => {
    const s = useSession.getState();
    s.setDraft(draft);
    s.appendDraftExercises([
      { exerciseId: 'Barbell_Hip_Thrust', restSec: 60, sets: [] },
      { exerciseId: 'Barbell_Squat', restSec: 60, sets: [{ reps: 10, weight: 0 }] },
    ]);
    expect(useSession.getState().draft!.exercises.map((e) => e.exerciseId)).toEqual([
      'Barbell_Hip_Thrust',
      'Butt_Lift_Bridge',
      'Barbell_Squat',
    ]);
  });
});
