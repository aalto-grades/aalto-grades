// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {RowData} from '@tanstack/react-table';
import {type ChangeEvent, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import type {SharedTable} from './features';

/**
 * Search state synced with the `?search=` query parameter and the table's
 * global filter. Returns the value and handlers to pass to the shared Search
 * component.
 */
export const useTableSearch = <TData extends RowData>(table: SharedTable<TData>): {
  searchValue: string;
  handleSearch: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  resetSearch: () => void;
} => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  // Set initial search value from query param (only on first render)
  const [searchValue, setSearchValue] = useState(initialSearch);

  // Keep the table global filter in sync with the search value
  useEffect(() => {
    table.setGlobalFilter(searchValue);
  }, [searchValue, table]);

  const handleSearch = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setSearchValue(e.target.value);
    if (e.target.value) {
      searchParams.set('search', e.target.value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams, {replace: true});
  };

  const resetSearch = (): void => {
    setSearchValue('');
  };

  return {searchValue, handleSearch, resetSearch};
};
