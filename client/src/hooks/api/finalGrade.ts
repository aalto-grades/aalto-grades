// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
  type EditFinalGrade,
  type FinalGradeData,
  FinalGradeDataArraySchema,
  type FinalGradeIdArray,
  type NewFinalGrade,
  type SisuCsvUpload,
} from '@/common/types';
import type {Numeric} from '@/types';
import axios from './axios';

export const useGetFinalGrades = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<FinalGradeData[]>>
): UseQueryResult<FinalGradeData[]> =>
  useQuery({
    queryKey: ['final-grades', courseId],
    queryFn: async () =>
      FinalGradeDataArraySchema.parse(
        (await axios.get(`/api/v1/courses/${courseId}/final-grades`)).data
      ),
    ...options,
  });

export const useAddFinalGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, NewFinalGrade[]>
): UseMutationResult<void, unknown, NewFinalGrade[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async newFinalGrades =>
      axios.post(`/api/v1/courses/${courseId}/final-grades`, newFinalGrades),

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
    mutationFn: async vars =>
      axios.put(
        `/api/v1/courses/${courseId}/final-grades/${vars.finalGradeId}`,
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
    mutationFn: async finalGradeId =>
      axios.delete(`/api/v1/courses/${courseId}/final-grades/${finalGradeId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });
    },
    ...options,
  });
};

const invalidateGradeQueries = (queryClient: ReturnType<typeof useQueryClient>, courseId: Numeric): void => {
  queryClient.invalidateQueries({queryKey: ['grades', courseId]});
  queryClient.invalidateQueries({queryKey: ['final-grades', courseId]});
  queryClient.invalidateQueries({queryKey: ['course-parts', courseId]});
};

export const useDeleteFinalGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, FinalGradeIdArray>
): UseMutationResult<void, unknown, FinalGradeIdArray> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async finalGradeIds =>
      axios.post(
        `/api/v1/courses/${courseId}/final-grades/delete`,
        finalGradeIds
      ),

    onSuccess: () => {
      invalidateGradeQueries(queryClient, courseId);
    },
    ...options,
  });
};

export const useUndoSisuExportFinalGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, FinalGradeIdArray>
): UseMutationResult<void, unknown, FinalGradeIdArray> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async finalGradeIds =>
      axios.post(
        `/api/v1/courses/${courseId}/final-grades/undo-sisu-export`,
        finalGradeIds
      ),

    onSuccess: () => {
      invalidateGradeQueries(queryClient, courseId);
    },
    ...options,
  });
};

type DownloadSisuGradeCsvVars = {courseId: Numeric; data: SisuCsvUpload};
export const useDownloadSisuGradeCsv = (
  options?: UseMutationOptions<BlobPart, unknown, DownloadSisuGradeCsvVars>
): UseMutationResult<BlobPart, unknown, DownloadSisuGradeCsvVars> =>
  useMutation({
    mutationFn: async vars =>
      (
        await axios.post<BlobPart>(
          `/api/v1/courses/${vars.courseId}/final-grades/csv/sisu`,
          vars.data
        )
      ).data,
    ...options,
  });
