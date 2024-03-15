// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NewFinalGrade} from '@common/types';
import {
  QueryClient,
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import axios from './axios';

import {Numeric} from '../../types';

export function useAddFinalGrades(
  courseId: Numeric,
  options?: UseMutationOptions<boolean, unknown, unknown>
) {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewFinalGrade[]) =>
      (
        await axios.post(`/v1/courses/${courseId}/finalGrades`, {
          finalGrades: data,
        })
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
}
