// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationOptions, UseMutationResult,
  useQuery, UseQueryOptions, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useDownloadCsvTemplate(
  courseId: Numeric,
  assessmentModelId: Numeric,
  options?: UseQueryOptions<string>
): UseQueryResult<string> {
  return useQuery({
    queryKey: ['download-csv-template', courseId, assessmentModelId],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv`
      )
    ).data,
    ...options
  });
}

export function useExportSisuGradeCsv(
  courseId: Numeric,
  assessmentModelId: Numeric,
  params: {
    completionLanguage?: string,
    assessmentDate?: string,
    studentNumbers: Array<string>
  },
  options?: UseQueryOptions<BlobPart>
): UseQueryResult<BlobPart> {
  return useQuery({
    queryKey: ['export-sisu-grade-csv', courseId, assessmentModelId],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv/sisu`,
        {
          responseType: 'blob',
          params
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
