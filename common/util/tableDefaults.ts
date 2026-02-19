// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

export const DEFAULT_TABLE_ROW_HEADERS = [0, 1, 2, 3, 4, 5];
export const DEFAULT_TABLE_COL_HEADERS = [0, 1, 2, 3, 4, 5];
export const DEFAULT_TRIANGULAR_GRID: number[][] = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1],
  [0, 1, 2, 2, 2, 2],
  [0, 1, 2, 3, 3, 3],
  [0, 1, 2, 3, 4, 4],
  [0, 1, 2, 3, 4, 5],
];

export const DEFAULT_TABLE_SETTINGS = {
  rowHeaders: DEFAULT_TABLE_ROW_HEADERS,
  colHeaders: DEFAULT_TABLE_COL_HEADERS,
  grid: DEFAULT_TRIANGULAR_GRID,
};
