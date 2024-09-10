// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type EditTaskGradeData,
  type LatestGrades,
  LatestGradesSchema,
  type NewTaskGrade,
  type SisuCsvUpload,
  type StudentRow,
  StudentRowArraySchema,
  type UserIdArray,
} from '@/common/types';
import type {Numeric} from '@/types';
import axios from './axios';

export const useGetGrades = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<StudentRow[]>>
): UseQueryResult<StudentRow[]> =>
  useQuery({
    queryKey: ['grades', courseId],
    queryFn: async () =>
      StudentRowArraySchema.parse(
        (await axios.get(`/api/v1/courses/${courseId}/grades`)).data
      ),
    ...options,
  });

export const useAddGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, NewTaskGrade[]>
): UseMutationResult<void, unknown, NewTaskGrade[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async newGrades =>
      axios.post(`/api/v1/courses/${courseId}/grades`, newGrades),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades', courseId],
      });
    },
    ...options,
  });
};

type EditGradeVars = {gradeId: Numeric; data: EditTaskGradeData};
export const useEditGrade = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, EditGradeVars>
): UseMutationResult<void, unknown, EditGradeVars> =>
  useMutation({
    mutationFn: async vars =>
      axios.put(
        `/api/v1/courses/${courseId}/grades/${vars.gradeId}`,
        vars.data
      ),
    ...options,
  });

export const useDeleteGrade = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, Numeric>
): UseMutationResult<void, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async gradeId =>
      axios.delete(`/api/v1/courses/${courseId}/grades/${gradeId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });
    },
    ...options,
  });
};

export const useGetLatestGrades = (
  options?: UseMutationOptions<LatestGrades, unknown, UserIdArray>
): UseMutationResult<LatestGrades, unknown, UserIdArray> =>
  useMutation({
    mutationFn: async userIds =>
      LatestGradesSchema.parse(
        (await axios.post('/api/v1/latest-grades', userIds)).data
      ),
    ...options,
  });

type DownloadSisuGradeCsvVars = {courseId: Numeric; data: SisuCsvUpload};
export const useDownloadSisuGradeCsv = (
  options?: UseMutationOptions<BlobPart, unknown, DownloadSisuGradeCsvVars>
): UseMutationResult<BlobPart, unknown, DownloadSisuGradeCsvVars> =>
  useMutation({
    mutationFn: async vars =>
      (
        await axios.post<BlobPart>(
          `/api/v1/courses/${vars.courseId}/grades/csv/sisu`,
          vars.data
        )
      ).data,
    ...options,
  });
