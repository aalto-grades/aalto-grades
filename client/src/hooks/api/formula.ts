// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, FormulaData } from 'aalto-grades-common/types';
import axios from './axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export function useGetFormula(formulaId: Formula): UseQueryResult<FormulaData> {
  return useQuery({
    queryKey: ['formula', formulaId],
    queryFn: async () => (
      await axios.get(`/v1/formulas/${formulaId}`)
    ).data.data.formula
  });
}

export function useGetAllFormulas(): UseQueryResult<Array<FormulaData>> {
  return useQuery({
    queryKey: ['all-formulas'],
    queryFn: async () => (
      await axios.get('/v1/formulas')
    ).data.data.formulas
  });
}
