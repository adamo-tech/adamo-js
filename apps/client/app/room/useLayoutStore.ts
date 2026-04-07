'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { LayoutStore } from './camera-layout';
import { createDefaultStore } from './camera-layout';

const STORAGE_KEY = 'adamo-camera-layouts';
let cached: LayoutStore | null = null;
const listeners = new Set<() => void>();

function read(): LayoutStore {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cached = JSON.parse(raw) as LayoutStore;
      return cached;
    }
  } catch {}
  cached = createDefaultStore();
  return cached;
}

function write(store: LayoutStore) {
  cached = store;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  listeners.forEach((fn) => fn());
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null;
      listeners.forEach((fn) => fn());
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** Inject an externally-loaded store (e.g. from API) into localStorage and notify listeners. */
export function seedLayoutStore(store: LayoutStore) {
  write(store);
}

export function useLayoutStore(): [LayoutStore, (fn: (prev: LayoutStore) => LayoutStore) => void] {
  const store = useSyncExternalStore(subscribe, read, read);
  const update = useCallback(
    (fn: (prev: LayoutStore) => LayoutStore) => {
      write(fn(read()));
    },
    [],
  );
  return [store, update];
}
