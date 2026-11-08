import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '@/lib/types';
import { kvStorage } from './storage';

type ProfileState = {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  update: (patch: Partial<Profile>) => void;
  advanceSplitDay: () => void;
  reset: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      update: (patch) => set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : s)),
      advanceSplitDay: () =>
        set((s) =>
          s.profile ? { profile: { ...s.profile, splitDayIndex: s.profile.splitDayIndex + 1 } } : s,
        ),
      reset: () => set({ profile: null }),
    }),
    { name: 'forge.profile', storage: kvStorage, version: 1 },
  ),
);
