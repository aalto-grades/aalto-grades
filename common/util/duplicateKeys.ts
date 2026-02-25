// SPDX-FileCopyrightText: 2026 The Ossi Developers
// SPDX-License-Identifier: MIT

export const getDuplicateIndices = (arr: string[]): Set<number> => {
  const counts = new Map<string, number>();
  arr.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
  const dup = new Set<number>();
  arr.forEach((v, i) => {
    if ((counts.get(v) ?? 0) > 1) dup.add(i);
  });
  return dup;
};

// The same value appears multiple times, the first occurrence gets the original value as key
export const getStableKeys = (arr: string[]): string[] => {
  const counts = new Map<string, number>();
  return arr.map((v) => {
    const c = counts.get(v) ?? 0;
    counts.set(v, c + 1);
    return c === 0 ? v : `${v}#${c}`;
  });
};
