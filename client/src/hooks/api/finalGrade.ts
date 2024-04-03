// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGradeData, NewFinalGrade} from '@common/types';
import {
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {Numeric} from '../../types';
import axios from './axios';

export const useAddFinalGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<Record<string, never>, unknown, NewFinalGrade[]>
): UseMutationResult<Record<string, never>, unknown, NewFinalGrade[]> => {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewFinalGrade[]) =>
      (
        await axios.post<{data: Record<string, never>}>(
          `/v1/courses/${courseId}/finalGrades`,
          {finalGrades: data}
        )
      ).data.data,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades', courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['final-grades', courseId],
      });
    },
    ...options,
  });
};

export const useGetFinalGrades = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<FinalGradeData[]>>
): UseQueryResult<FinalGradeData[]> =>
  useQuery({
    queryKey: ['final-grades', courseId],
    queryFn: async () =>
      (
        await axios.get<{data: FinalGradeData[]}>(
          `/v1/courses/${courseId}/finalGrades`
        )
      ).data.data,
    ...options,
  });
