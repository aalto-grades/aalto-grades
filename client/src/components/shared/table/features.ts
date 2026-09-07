// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type RowData,
  createExpandedRowModel,
  createFilteredRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  stockFeatures,
  type useTable,
} from '@tanstack/react-table';
import '@tanstack/react-table';

/**
 * Table feature set shared by every TanStack table in the app. Keep all
 * providers on this exact object so shared components (DataTable,
 * GroupByButton, ...) can be typed against `typeof features`.
 */
export const features = {
  ...stockFeatures,
  sortedRowModel: createSortedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  filteredRowModel: createFilteredRowModel(),
};

/** Table instance type produced by providers using the shared `features` */
export type SharedTable<TData extends RowData> = ReturnType<
  typeof useTable<typeof features, TData>
>;

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TFeatures, TData extends RowData, TValue> {
    PrettyChipPosition: 'first' | 'middle' | 'last' | 'alone';
    coursePart?: boolean;
  }
}
