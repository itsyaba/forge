import { useEffect, useState } from 'react';
import { useHistory } from './history';
import { useProfile } from './profile';
import { useSession } from './session';

const stores = [useProfile, useHistory, useSession];

/** True once all persisted stores have loaded from disk. */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(() => stores.every((s) => s.persist.hasHydrated()));
  useEffect(() => {
    if (ready) return;
    const check = () => {
      if (stores.every((s) => s.persist.hasHydrated())) setReady(true);
    };
    const unsubs = stores.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, [ready]);
  return ready;
}
