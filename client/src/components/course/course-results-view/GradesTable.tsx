// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {JSX} from 'react';

import DataTable from '@/components/shared/table/DataTable';
import {useTableContext} from '@/context/useTableContext';

const GradesTable = (): JSX.Element => {
  const {table} = useTableContext();
  return <DataTable table={table} />;
};
export default GradesTable;
