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
import axios from './axios';
import {Numeric} from '../../types';

export const useAddFinalGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, NewFinalGrade[]>
): UseMutationResult<unknown, unknown, NewFinalGrade[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newFinalGrades: NewFinalGrade[]) =>
      await axios.post(`/v1/courses/${courseId}/final-grades`, newFinalGrades),

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
      FinalGradeDataArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/final-grades`)).data
      ),
    ...options,
  });

type EditFinalGradeVars = {finalGradeId: Numeric; data: EditFinalGrade};
export const useEditFinalGrade = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, EditFinalGradeVars>
): UseMutationResult<unknown, unknown, EditFinalGradeVars> =>
  useMutation({
    mutationFn: async (vars: EditFinalGradeVars) =>
      await axios.put(
        `/v1/courses/${courseId}/final-grades/${vars.finalGradeId}`,
        vars.data
      ),
    ...options,
  });

export const useDeleteFinalGrade = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, Numeric>
): UseMutationResult<unknown, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (finalGradeId: Numeric) =>
      await axios.delete(
        `/v1/courses/${courseId}/final-grades/${finalGradeId}`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });
    },
    ...options,
  });
};
