import type { GroupId, Muscle } from '@/lib/types';

export type MuscleGroup = {
  id: GroupId;
  name: string;
  /** dataset muscles that put an exercise in this group (as primary muscle) */
  muscles: Muscle[];
  /** also include compound moves that hit these muscles secondarily */
  secondaryCompound?: Muscle[];
  /** "big" groups get 2 exercises in a split day, small groups 1 */
  big: boolean;
  /** curated, beginner-friendly picks in priority order (mixed equipment) */
  topPicks: string[];
};

export const GROUPS: MuscleGroup[] = [
  {
    id: 'chest',
    name: 'Chest',
    muscles: ['chest'],
    big: true,
    topPicks: [
      'Dumbbell_Bench_Press',
      'Barbell_Bench_Press_-_Medium_Grip',
      'Machine_Bench_Press',
      'Incline_Dumbbell_Press',
      'Pushups',
      'Incline_Push-Up',
      'Cable_Crossover',
      'Dumbbell_Flyes',
      'Bench_Press_-_With_Bands',
      'Alternating_Floor_Press',
    ],
  },
  {
    id: 'back',
    name: 'Back',
    muscles: ['lats', 'middle back', 'lower back', 'traps'],
    big: true,
    topPicks: [
      'Wide-Grip_Lat_Pulldown',
      'Seated_Cable_Rows',
      'One-Arm_Dumbbell_Row',
      'Bent_Over_Barbell_Row',
      'Pullups',
      'Chin-Up',
      'Bent_Over_Two-Dumbbell_Row',
      'Inverted_Row',
      'Two-Arm_Kettlebell_Row',
      'Upright_Row_-_With_Bands',
      'Hyperextensions_With_No_Hyperextension_Bench',
      'Dumbbell_Shrug',
    ],
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    muscles: ['shoulders'],
    big: false,
    topPicks: [
      'Dumbbell_Shoulder_Press',
      'Side_Lateral_Raise',
      'Machine_Shoulder_Military_Press',
      'Seated_Dumbbell_Press',
      'Face_Pull',
      'Reverse_Flyes',
      'Standing_Military_Press',
      'Front_Dumbbell_Raise',
      'Shoulder_Press_-_With_Bands',
      'Lateral_Raise_-_With_Bands',
      'Band_Pull_Apart',
      'Two-Arm_Kettlebell_Military_Press',
    ],
  },
  {
    id: 'biceps',
    name: 'Biceps',
    muscles: ['biceps'],
    big: false,
    topPicks: [
      'Dumbbell_Bicep_Curl',
      'Hammer_Curls',
      'Barbell_Curl',
      'Standing_Biceps_Cable_Curl',
      'EZ-Bar_Curl',
      'Incline_Dumbbell_Curl',
      'Preacher_Curl',
      'Concentration_Curls',
      'Machine_Bicep_Curl',
      'Chin-Up',
    ],
  },
  {
    id: 'triceps',
    name: 'Triceps',
    muscles: ['triceps'],
    big: false,
    topPicks: [
      'Triceps_Pushdown_-_Rope_Attachment',
      'Triceps_Pushdown',
      'Standing_Dumbbell_Triceps_Extension',
      'Bench_Dips',
      'Tricep_Dumbbell_Kickback',
      'EZ-Bar_Skullcrusher',
      'Close-Grip_Barbell_Bench_Press',
      'Band_Skull_Crusher',
      'Push-Ups_-_Close_Triceps_Position',
    ],
  },
  {
    id: 'abs',
    name: 'Abs',
    muscles: ['abdominals'],
    big: false,
    topPicks: [
      'Plank',
      'Crunches',
      'Dead_Bug',
      'Reverse_Crunch',
      'Cable_Crunch',
      'Flat_Bench_Lying_Leg_Raise',
      'Russian_Twist',
      'Ab_Crunch_Machine',
      'Pallof_Press',
      'Air_Bike',
    ],
  },
  {
    id: 'glutes',
    name: 'Glutes',
    muscles: ['glutes'],
    secondaryCompound: ['glutes'],
    big: true,
    topPicks: [
      'Barbell_Hip_Thrust',
      'Barbell_Glute_Bridge',
      'Butt_Lift_Bridge',
      'Single_Leg_Glute_Bridge',
      'Romanian_Deadlift',
      'Split_Squat_with_Dumbbells',
      'Goblet_Squat',
      'Pull_Through',
      'One-Legged_Cable_Kickback',
      'Glute_Kickback',
      'Hip_Lift_with_Band',
      'Hip_Extension_with_Bands',
      'Dumbbell_Lunges',
      'One-Arm_Kettlebell_Swings',
    ],
  },
  {
    id: 'quads',
    name: 'Quads',
    muscles: ['quadriceps'],
    big: true,
    topPicks: [
      'Barbell_Squat',
      'Leg_Press',
      'Goblet_Squat',
      'Dumbbell_Squat',
      'Bodyweight_Squat',
      'Dumbbell_Lunges',
      'Leg_Extensions',
      'Split_Squat_with_Dumbbells',
      'Hack_Squat',
      'Bodyweight_Walking_Lunge',
      'Squats_-_With_Bands',
      'Dumbbell_Step_Ups',
    ],
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    muscles: ['hamstrings'],
    big: false,
    topPicks: [
      'Romanian_Deadlift',
      'Lying_Leg_Curls',
      'Seated_Leg_Curl',
      'Stiff-Legged_Dumbbell_Deadlift',
      'Ball_Leg_Curl',
      'Band_Good_Morning',
      'One-Arm_Kettlebell_Swings',
      'Kettlebell_One-Legged_Deadlift',
      'Good_Morning',
      'Single_Leg_Glute_Bridge',
    ],
  },
  {
    id: 'calves',
    name: 'Calves',
    muscles: ['calves'],
    big: false,
    topPicks: [
      'Standing_Calf_Raises',
      'Seated_Calf_Raise',
      'Standing_Dumbbell_Calf_Raise',
      'Calf_Press_On_The_Leg_Press_Machine',
      'Calf_Raises_-_With_Bands',
      'Smith_Machine_Calf_Raise',
    ],
  },
];

export const GROUP_BY_ID = Object.fromEntries(GROUPS.map((g) => [g.id, g])) as Record<
  GroupId,
  MuscleGroup
>;
