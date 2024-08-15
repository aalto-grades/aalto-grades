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
  EditTaskGradeData,
  LatestGrades,
  LatestGradesSchema,
  NewTaskGrade,
  SisuCsvUpload,
  StudentRow,
  StudentRowArraySchema,
  UserIdArray,
} from '@/common/types';
import {Numeric} from '@/types';
import axios from './axios';

export const useGetGrades = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<StudentRow[]>>
): UseQueryResult<StudentRow[]> =>
  useQuery({
    queryKey: ['grades', courseId],
    queryFn: async () =>
      StudentRowArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/grades`)).data
      ),
    ...options,
  });

export const useAddGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, NewTaskGrade[]>
): UseMutationResult<void, unknown, NewTaskGrade[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newGrades =>
      axios.post(`/v1/courses/${courseId}/grades`, newGrades),

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
    mutationFn: vars =>
      axios.put(`/v1/courses/${courseId}/grades/${vars.gradeId}`, vars.data),
    ...options,
  });

export const useDeleteGrade = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, Numeric>
): UseMutationResult<void, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gradeId =>
      axios.delete(`/v1/courses/${courseId}/grades/${gradeId}`),

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
        (await axios.post('/v1/latest-grades', userIds)).data
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
          `/v1/courses/${vars.courseId}/grades/csv/sisu`,
          vars.data
        )
      ).data,
    ...options,
  });
