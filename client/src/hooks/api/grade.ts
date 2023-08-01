// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, FinalGrade } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationOptions, UseMutationResult,
  useQuery, UseQueryOptions, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

interface DownloadCsvTemplateVars {
  courseId: Numeric,
  assessmentModelId: Numeric
}

export type UseDownloadCsvTemplateResult = UseMutationResult<
  string, unknown, DownloadCsvTemplateVars
>;

export function useDownloadCsvTemplate(
  options?: UseMutationOptions<string, unknown, DownloadCsvTemplateVars>
): UseDownloadCsvTemplateResult {
  return useMutation({
    mutationFn: async (vars: DownloadCsvTemplateVars) => (
      await axios.get(
        `/v1/courses/${vars.courseId}`
        + `/assessment-models/${vars.assessmentModelId}/grades/csv`
      )
    ).data,
    ...options
  });
}

interface DownloadSisuGradeCsvVars {
  courseId: Numeric,
  assessmentModelId: Numeric,
  params: {
    completionLanguage?: string,
    assessmentDate?: string,
    studentNumbers: Array<string>
  }
}

export type UseDownloadSisuGradeCsvResult = UseMutationResult<
  BlobPart, unknown, DownloadSisuGradeCsvVars
>;

export function useDownloadSisuGradeCsv(
  options?: UseMutationOptions<BlobPart, unknown, DownloadSisuGradeCsvVars>
): UseDownloadSisuGradeCsvResult {
  return useMutation({
    mutationFn: async (vars: DownloadSisuGradeCsvVars): Promise<BlobPart> => (
      await axios.get(
        `/v1/courses/${vars.courseId}`
        + `/assessment-models/${vars.assessmentModelId}/grades/csv/sisu`,
        {
          responseType: 'blob',
          params: vars.params
        }
      )
    ).data,
    ...options
  });
}

export function useGetFinalGrades(
  courseId: Numeric,
  assessmentModelId: Numeric,
  options?: UseQueryOptions<Array<FinalGrade>>
): UseQueryResult<Array<FinalGrade>> {
  return useQuery({
    queryKey: ['final-grades', courseId, assessmentModelId],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades`
      )
    ).data.data,
    ...options
  });
}

export function useGetGradeTreeOfUser(
  courseId: Numeric,
  assessmentModelId: Numeric,
  userId: Numeric,
  options?: UseQueryOptions<AttainmentGradeData>
): UseQueryResult<AttainmentGradeData> {
  return useQuery({
    queryKey: ['final-grades-user', courseId, assessmentModelId, userId],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/user/${userId}`
      )
    ).data.data,
    ...options
  });
}

interface UploadGradeCsvVars {
  courseId: Numeric,
  assessmentModelId: Numeric,
  csv: unknown
}

export type UseUploadGradeCsvResult = UseMutationResult<
  unknown, unknown, UploadGradeCsvVars
>;

export function useUploadGradeCsv(
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseUploadGradeCsvResult {
  return useMutation({
    mutationFn: async (vars: UploadGradeCsvVars) => (
      await axios.postForm(
        `/v1/courses/${vars.courseId}`
        + `/assessment-models/${vars.assessmentModelId}`
        + '/grades/csv',
        {
          csv_data: vars.csv // FileList will be unwrapped as sepate fields
        }
      )
    ).data.data,
    ...options
  });
}

interface CalculateFinalGradesVars {
  courseId: Numeric,
  assessmentModelId: Numeric,
  studentNumbers: Array<string>
}

export type UseCalculateFinalGradesResult = UseMutationResult<
  boolean, unknown, CalculateFinalGradesVars
>;

export function useCalculateFinalGrades(
  options?: UseMutationOptions<boolean, unknown, unknown>
): UseCalculateFinalGradesResult {
  return useMutation({
    mutationFn: async (vars: CalculateFinalGradesVars) => (
      await axios.post(
        `/v1/courses/${vars.courseId}`
        + `/assessment-models/${vars.assessmentModelId}`
        + '/grades/calculate',
        { studentNumbers: vars.studentNumbers }
      )
    ).data.data,
    ...options
  });
}
