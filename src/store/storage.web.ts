// Web build (browser preview only): persist to localStorage instead of SQLite.
import { createJSONStorage } from 'zustand/middleware';

export const kvStorage = createJSONStorage(() => localStorage);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
