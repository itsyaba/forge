import Storage from 'expo-sqlite/kv-store';
import { createJSONStorage } from 'zustand/middleware';

export const kvStorage = createJSONStorage(() => ({
  getItem: (k: string) => Storage.getItem(k),
  setItem: (k: string, v: string) => Storage.setItem(k, v),
  removeItem: (k: string) => Storage.removeItem(k),
}));

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
