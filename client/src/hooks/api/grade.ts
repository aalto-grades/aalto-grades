// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  NewGrade,
  PartialGradeOption,
  SisuCsvUpload,
  StudentRow,
  StudentRowArraySchema,
} from '@common/types';
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from './axios';

import {Numeric} from '../../types';

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

export const useAddGrades = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, NewGrade[]>
): UseMutationResult<unknown, unknown, NewGrade[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGrades: NewGrade[]) =>
      await axios.post(`/v1/courses/${courseId}/grades`, newGrades),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades', courseId],
      });
    },
    ...options,
  });
};

type EditGradeVars = {
  courseId?: Numeric;
  assessmentModelId?: Numeric;
  gradeId?: Numeric;
  data?: PartialGradeOption;
};
export const useEditGrade = (
  options?: UseMutationOptions<unknown, unknown, EditGradeVars>
): UseMutationResult<unknown, unknown, EditGradeVars> =>
  useMutation({
    mutationFn: async (vars: EditGradeVars) =>
      await axios.put(
        `/v1/courses/${vars.courseId}/assessment-models/` +
          `${vars.assessmentModelId}/grades/${vars.gradeId}`,
        vars.data
      ),

    ...options,
  });
