// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Formula, FormulaData} from '@common/types';
import axios from './axios';
import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';

export function useGetFormula(
  formulaId: Formula,
  options?: UseQueryOptions<FormulaData>
): UseQueryResult<FormulaData> {
  return useQuery({
    queryKey: ['formula', formulaId],
    queryFn: async () =>
      (await axios.get(`/v1/formulas/${formulaId}`)).data.data,
    ...options,
  });
}

export function useGetAllFormulas(
  options?: UseQueryOptions<Array<FormulaData>>
): UseQueryResult<Array<FormulaData>> {
  return useQuery({
    queryKey: ['all-formulas'],
    queryFn: async () => (await axios.get('/v1/formulas')).data.data,
    ...options,
  });
}
