'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { LayoutStore } from './camera-layout';
import { createDefaultStore } from './camera-layout';

const STORAGE_PREFIX = 'adamo-camera-layouts';
const cache = new Map<string, LayoutStore>();
const listeners = new Set<() => void>();

function storageKey(key: string): string {
  return key ? `${STORAGE_PREFIX}:${key}` : STORAGE_PREFIX;
}

function read(key: string): LayoutStore {
  const sk = storageKey(key);
  const c = cache.get(sk);
  if (c) return c;
  try {
    const raw = localStorage.getItem(sk);
    if (raw) {
      const store = JSON.parse(raw) as LayoutStore;
      cache.set(sk, store);
      return store;
    }
  } catch {}
  const store = createDefaultStore();
  cache.set(sk, store);
  return store;
}

function write(key: string, store: LayoutStore) {
  const sk = storageKey(key);
  cache.set(sk, store);
  localStorage.setItem(sk, JSON.stringify(store));
  listeners.forEach((fn) => fn());
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(STORAGE_PREFIX)) {
      cache.delete(e.key);
      listeners.forEach((fn) => fn());
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** Inject an externally-loaded store (e.g. from API) into the cache, localStorage, and notify listeners. */
export function seedLayoutStore(key: string, store: LayoutStore) {
  write(key, store);
}

export function useLayoutStore(
  key = '',
): [LayoutStore, (fn: (prev: LayoutStore) => LayoutStore) => void] {
  const getSnapshot = useCallback(() => read(key), [key]);
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const update = useCallback(
    (fn: (prev: LayoutStore) => LayoutStore) => {
      write(key, fn(read(key)));
    },
    [key],
  );
  return [store, update];
}
