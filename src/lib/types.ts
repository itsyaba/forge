export type Muscle =
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower back'
  | 'middle back'
  | 'neck'
  | 'quadriceps'
  | 'shoulders'
  | 'traps'
  | 'triceps';

export type Exercise = {
  id: string;
  name: string;
  equipment: string;
  level: 'beginner' | 'intermediate';
  mechanic: 'compound' | 'isolation' | null;
  primary: Muscle[];
  secondary: Muscle[];
  instructions: string[];
  images: string[];
};

export type GroupId =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type Gender = 'male' | 'female' | 'other';
export type Unit = 'kg' | 'lb';
export type Experience = 'never' | 'some' | 'regular';
export type Goal = 'muscle' | 'strength' | 'fatloss' | 'general';
export type Location = 'gym' | 'home';
export type HomeEquipment = 'dumbbells' | 'bands' | 'kettlebell' | 'pullupbar';

/** 0 = Monday … 6 = Sunday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Profile = {
  name: string;
  gender: Gender;
  bodyWeight: number;
  unit: Unit;
  experience: Experience;
  goal: Goal;
  days: Weekday[];
  location: Location;
  equipment: HomeEquipment[];
  activeSplitId: string | null;
  /** index of the next split day to do */
  splitDayIndex: number;
  createdAt: number;
};

export type PlannedSet = { reps: number; weight: number };

export type PlannedExercise = {
  exerciseId: string;
  restSec: number;
  sets: PlannedSet[];
  /** true when the weight was bumped by the progressive-overload rule */
  bumped?: boolean;
};

export type WorkoutSource =
  | { type: 'muscle'; id: GroupId }
  | { type: 'split'; id: string; dayIndex: number }
  | { type: 'custom' };

export type DraftWorkout = {
  title: string;
  source: WorkoutSource;
  exercises: PlannedExercise[];
};

export type LoggedSet = {
  reps: number;
  weight: number;
  targetReps: number;
  done: boolean;
  completedAt?: number;
};

export type LoggedExercise = {
  exerciseId: string;
  restSec: number;
  sets: LoggedSet[];
};

export type ActiveWorkout = {
  id: string;
  title: string;
  source: WorkoutSource;
  startedAt: number;
  exercises: LoggedExercise[];
  cursor: { ex: number; set: number };
  restEndsAt: number | null;
};

export type Workout = {
  id: string;
  title: string;
  source: WorkoutSource;
  startedAt: number;
  endedAt: number;
  exercises: LoggedExercise[];
};

export type BodyWeightEntry = { date: string; weight: number };

export type SplitDay = { name: string; groups: GroupId[] };

export type Split = {
  id: string;
  name: string;
  blurb: string;
  days: SplitDay[];
};
