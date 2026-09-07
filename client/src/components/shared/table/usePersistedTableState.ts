// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Dispatch, type SetStateAction, useEffect, useState} from 'react';

/**
 * useState whose value is persisted to localStorage under a single shared
 * state object, so table view state (grouping, sorting, filters, ...) survives
 * a page refresh.
 *
 * All persisted keys of one table share the same `storageKey` and are stored
 * together as one JSON object: a single write per change, a single parse on
 * mount, and adding a new persisted field is just adding another hook call.
 *
 * Values are validated with a zod schema on read, so stale or corrupted
 * storage (e.g. after a model was deleted) silently falls back to `initial`.
 */
export function usePersistedTableState<T>(
  storageKey: string,
  stateKey: string,
  initial: T,
  parse: (raw: unknown) => T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return initial;
      const parsed: unknown = JSON.parse(raw);
      const entry =
        parsed !== null && typeof parsed === 'object'
          ? (parsed as Record<string, unknown>)[stateKey]
          : undefined;
      return entry === undefined ? initial : parse(entry);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const prev: unknown = raw === null ? {} : JSON.parse(raw);
      const obj =
        prev !== null && typeof prev === 'object'
          ? (prev as Record<string, unknown>)
          : {};
      obj[stateKey] = value;
      localStorage.setItem(storageKey, JSON.stringify(obj));
    } catch {
      // Storage full or unavailable, persistence is best effort
    }
  }, [storageKey, stateKey, value]);

  return [value, setValue];
}
