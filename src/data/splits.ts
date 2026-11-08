import type { Split } from '@/lib/types';

export const SPLITS: Split[] = [
  {
    id: 'fullbody-2',
    name: 'Full Body',
    blurb: 'Hit everything twice a week. Perfect start.',
    days: [
      { name: 'Full Body A', groups: ['quads', 'chest', 'back', 'abs'] },
      { name: 'Full Body B', groups: ['glutes', 'shoulders', 'back', 'hamstrings'] },
    ],
  },
  {
    id: 'fullbody-3',
    name: 'Full Body',
    blurb: 'Three short sessions that cover your whole body.',
    days: [
      { name: 'Full Body A', groups: ['quads', 'chest', 'back', 'abs'] },
      { name: 'Full Body B', groups: ['glutes', 'shoulders', 'back', 'biceps'] },
      { name: 'Full Body C', groups: ['hamstrings', 'chest', 'triceps', 'abs'] },
    ],
  },
  {
    id: 'glutes-3',
    name: 'Glutes & Legs Focus',
    blurb: 'Two lower days with extra glute work, one upper day.',
    days: [
      { name: 'Glutes & Hamstrings', groups: ['glutes', 'hamstrings', 'abs'] },
      { name: 'Upper Body', groups: ['back', 'shoulders', 'chest', 'triceps'] },
      { name: 'Glutes & Quads', groups: ['glutes', 'quads', 'calves'] },
    ],
  },
  {
    id: 'ppl-3',
    name: 'Push / Pull / Legs',
    blurb: 'Classic gym split: pushing, pulling, then legs.',
    days: [
      { name: 'Push', groups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull', groups: ['back', 'biceps', 'abs'] },
      { name: 'Legs', groups: ['quads', 'hamstrings', 'glutes', 'calves'] },
    ],
  },
  {
    id: 'upper-lower-4',
    name: 'Upper / Lower',
    blurb: 'Alternate upper and lower body. Great balance.',
    days: [
      { name: 'Upper A', groups: ['chest', 'back', 'shoulders', 'biceps'] },
      { name: 'Lower A', groups: ['quads', 'hamstrings', 'calves', 'abs'] },
      { name: 'Upper B', groups: ['back', 'chest', 'shoulders', 'triceps'] },
      { name: 'Lower B', groups: ['glutes', 'hamstrings', 'quads', 'abs'] },
    ],
  },
  {
    id: 'glutes-4',
    name: 'Glutes & Legs Focus',
    blurb: 'Two glute-heavy days, two upper days.',
    days: [
      { name: 'Glutes & Hamstrings', groups: ['glutes', 'hamstrings', 'abs'] },
      { name: 'Upper Body', groups: ['back', 'shoulders', 'triceps'] },
      { name: 'Glutes & Quads', groups: ['glutes', 'quads', 'calves'] },
      { name: 'Upper Body', groups: ['chest', 'back', 'biceps', 'abs'] },
    ],
  },
  {
    id: 'fullbody-4',
    name: 'Full Body',
    blurb: 'Four lighter full-body sessions.',
    days: [
      { name: 'Full Body A', groups: ['quads', 'chest', 'back', 'abs'] },
      { name: 'Full Body B', groups: ['glutes', 'shoulders', 'back', 'biceps'] },
      { name: 'Full Body C', groups: ['hamstrings', 'chest', 'triceps', 'abs'] },
      { name: 'Full Body D', groups: ['quads', 'back', 'shoulders', 'calves'] },
    ],
  },
  {
    id: 'ulppl-5',
    name: 'Upper / Lower + PPL',
    blurb: 'Five days mixing upper/lower with push/pull/legs.',
    days: [
      { name: 'Upper', groups: ['chest', 'back', 'shoulders', 'biceps'] },
      { name: 'Lower', groups: ['quads', 'hamstrings', 'calves', 'abs'] },
      { name: 'Push', groups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull', groups: ['back', 'biceps', 'abs'] },
      { name: 'Legs', groups: ['glutes', 'quads', 'hamstrings'] },
    ],
  },
  {
    id: 'ppl-6',
    name: 'Push / Pull / Legs ×2',
    blurb: 'High frequency for people who love the gym.',
    days: [
      { name: 'Push', groups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull', groups: ['back', 'biceps', 'abs'] },
      { name: 'Legs', groups: ['quads', 'hamstrings', 'calves'] },
      { name: 'Push', groups: ['shoulders', 'chest', 'triceps'] },
      { name: 'Pull', groups: ['back', 'biceps', 'abs'] },
      { name: 'Legs', groups: ['glutes', 'hamstrings', 'quads'] },
    ],
  },
];

export const SPLIT_BY_ID: Record<string, Split> = Object.fromEntries(SPLITS.map((s) => [s.id, s]));
