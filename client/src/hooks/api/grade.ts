// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentGradeData,
  EditGrade,
  FinalGradeData,
  NewGrade,
  StudentGradesTree,
  StudentRow,
} from '@common/types';
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
import axios from './axios';

import {Numeric} from '../../types';

interface DownloadCsvTemplateVars {
  courseId: Numeric;
  assessmentModelId: Numeric;
}

export type UseDownloadCsvTemplateResult = UseMutationResult<
  string,
  unknown,
  DownloadCsvTemplateVars
>;

export function useDownloadCsvTemplate(
  options?: UseMutationOptions<string, unknown, DownloadCsvTemplateVars>
): UseDownloadCsvTemplateResult {
  return useMutation({
    mutationFn: async (vars: DownloadCsvTemplateVars) =>
      (
        await axios.get(
          `/v1/courses/${vars.courseId}` +
            `/assessment-models/${vars.assessmentModelId}/grades/csv`
        )
      ).data,
    ...options,
  });
}

interface DownloadSisuGradeCsvVars {
  courseId: Numeric;
  completionLanguage?: string;
  assessmentDate?: string;
  studentNumbers: string[];
}

export type UseDownloadSisuGradeCsvResult = UseMutationResult<
  BlobPart,
  unknown,
  DownloadSisuGradeCsvVars
>;

export function useDownloadSisuGradeCsv(
  options?: UseMutationOptions<BlobPart, unknown, DownloadSisuGradeCsvVars>
): UseDownloadSisuGradeCsvResult {
  return useMutation({
    mutationFn: async (vars: DownloadSisuGradeCsvVars): Promise<BlobPart> =>
      (
        await axios.post(`/v1/courses/${vars.courseId}/grades/csv/sisu`, {
          responseType: 'blob',
          completionLanguage: vars.completionLanguage,
          assessmentDate: vars.assessmentDate,
          studentNumbers: vars.studentNumbers,
        })
      ).data as BlobPart,
    ...options,
  });
}

export function useGetFinalGrades(
  courseId: Numeric,
  options?: Partial<UseQueryOptions<Array<FinalGradeData>>>
): UseQueryResult<Array<FinalGradeData>> {
  return useQuery({
    queryKey: ['final-grades', courseId],
    queryFn: async () =>
      (await axios.get(`/v1/courses/${courseId}/finalGrades`)).data.data,
    ...options,
  });
}

export function useGetGradeTreeOfAllUsers(
  courseId: Numeric,
  assessmentModelId: Numeric,
  options?: Partial<UseQueryOptions<Array<StudentGradesTree>>>
): UseQueryResult<Array<StudentGradesTree>> {
  return useQuery({
    queryKey: ['grade-tree-of-all-users', courseId, assessmentModelId],
    queryFn: async () =>
      (
        await axios.get(
          `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/fullTree`
        )
      ).data.data,
    ...options,
  });
}
export function useGetGrades(
  courseId: Numeric,
  options?: Partial<UseQueryOptions<StudentRow[]>>
): UseQueryResult<StudentRow[]> {
  return useQuery({
    queryKey: ['grades', courseId],
    queryFn: async () =>
      (await axios.get(`/v1/courses/${courseId}/grades`)).data.data,
    ...options,
  });
}

export function useGetGradeTreeOfUser(
  courseId: Numeric,
  assessmentModelId: Numeric,
  userId: Numeric,
  options?: Partial<UseQueryOptions<AttainmentGradeData>>
): UseQueryResult<AttainmentGradeData> {
  return useQuery({
    queryKey: ['grade-tree-of-user', courseId, assessmentModelId, userId],
    queryFn: async () =>
      (
        await axios.get(
          `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/user/${userId}`
        )
      ).data.data,
    ...options,
  });
}

interface UploadGradeCsvVars {
  courseId: Numeric;
  assessmentModelId: Numeric;
  csv: unknown;
  params: {
    completionDate?: string;
    expiryDate?: string;
  };
}

export type UseUploadGradeCsvResult = UseMutationResult<
  unknown,
  unknown,
  UploadGradeCsvVars
>;

export function useUploadGradeCsv(
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseUploadGradeCsvResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: UploadGradeCsvVars) =>
      (
        await axios.postForm(
          `/v1/courses/${vars.courseId}` +
            `/assessment-models/${vars.assessmentModelId}` +
            '/grades/csv',
          {
            csv_data: vars.csv, // FileList will be unwrapped as sepate fields
            completionDate: vars.params.completionDate,
            expiryDate: vars.params.expiryDate,
          }
        )
      ).data.data,

    onSuccess: (_data: unknown, vars: UploadGradeCsvVars) => {
      queryClient.invalidateQueries({
        queryKey: ['final-grades', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: ['grade-tree-of-user', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'grade-tree-of-all-users',
          vars.courseId,
          vars.assessmentModelId,
        ],
      });
    },
    ...options,
  });
}

interface CalculateFinalGradesVars {
  courseId: Numeric;
  assessmentModelId: Numeric;
  studentNumbers: Array<string>;
}

export type UseCalculateFinalGradesResult = UseMutationResult<
  boolean,
  unknown,
  CalculateFinalGradesVars
>;

export function useCalculateFinalGrades(
  options?: UseMutationOptions<boolean, unknown, unknown>
): UseCalculateFinalGradesResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: CalculateFinalGradesVars) =>
      (
        await axios.post(
          `/v1/courses/${vars.courseId}` +
            `/assessment-models/${vars.assessmentModelId}` +
            '/grades/calculate',
          {studentNumbers: vars.studentNumbers}
        )
      ).data.data,

    onSuccess: (_data: unknown, vars: CalculateFinalGradesVars) => {
      queryClient.invalidateQueries({
        queryKey: ['final-grades', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: ['grade-tree-of-user', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'grade-tree-of-all-users',
          vars.courseId,
          vars.assessmentModelId,
        ],
      });
    },
    ...options,
  });
}

interface EditGradeVars {
  courseId: Numeric;
  assessmentModelId: Numeric;
  gradeId: Numeric;
  userId: Numeric;
  data: EditGrade;
}

export type UseEditGradeResult = UseMutationResult<
  boolean,
  unknown,
  EditGradeVars
>;

export function useEditGrade(
  options?: UseMutationOptions<boolean, unknown, unknown>
): UseEditGradeResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditGradeVars) =>
      (
        await axios.put(
          `/v1/courses/${vars.courseId}/assessment-models/` +
            `${vars.assessmentModelId}/grades/${vars.gradeId}`,
          vars.data
        )
      ).data.data,

    onSuccess: (_data: unknown, vars: EditGradeVars) => {
      queryClient.invalidateQueries({
        queryKey: [
          'grade-tree-of-user',
          vars.courseId,
          vars.assessmentModelId,
          vars.userId,
        ],
      });
    },
    ...options,
  });
}

export function useAddGrades(
  courseId: Numeric,
  options?: UseMutationOptions<boolean, unknown, unknown>
) {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewGrade[]) =>
      (await axios.post(`/v1/courses/${courseId}/grades`, {grades: data})).data
        .data,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades', courseId],
      });
    },
    ...options,
  });
}
