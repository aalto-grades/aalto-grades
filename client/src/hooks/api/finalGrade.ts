// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  EditFinalGrade,
  FinalGradeData,
  FinalGradeDataArraySchema,
  NewFinalGrade,
} from '@/common/types';
import {Numeric} from '@/types';
import axios from './axios';

export const useGetFinalGrades = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<FinalGradeData[]>>
): UseQueryResult<FinalGradeData[]> =>
  useQuery({
    queryKey: ['final-grades', courseId],
    queryFn: async () =>
      FinalGradeDataArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/final-grades`)).data
      ),
    ...options,
  });

export const useAddFinalGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, NewFinalGrade[]>
): UseMutationResult<void, unknown, NewFinalGrade[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newFinalGrades =>
      axios.post(`/v1/courses/${courseId}/final-grades`, newFinalGrades),

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

type EditFinalGradeVars = {finalGradeId: Numeric; data: EditFinalGrade};
export const useEditFinalGrade = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, EditFinalGradeVars>
): UseMutationResult<void, unknown, EditFinalGradeVars> =>
  useMutation({
    mutationFn: vars =>
      axios.put(
        `/v1/courses/${courseId}/final-grades/${vars.finalGradeId}`,
        vars.data
      ),
    ...options,
  });

export const useDeleteFinalGrade = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, Numeric>
): UseMutationResult<void, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finalGradeId =>
      axios.delete(`/v1/courses/${courseId}/final-grades/${finalGradeId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });
    },
    ...options,
  });
};
