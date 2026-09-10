// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {JSX} from 'react';

import DataTable from '@/components/shared/table/DataTable';
import {useFinalGradesTableContext} from '@/context/useFinalGradesTableContext';

const FinalGradesTable = (): JSX.Element => {
  const {table} = useFinalGradesTableContext();
  return <DataTable table={table} rowHeight={32} />;
};
export default FinalGradesTable;
