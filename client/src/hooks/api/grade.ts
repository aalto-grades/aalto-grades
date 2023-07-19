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
  params: unknown,
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
    ).data.data.finalGrades,
    ...options
  });
}

export function useUploadGradeCsv(
  courseId: Numeric,
  assessmentModelId: Numeric,
  csv: unknown,
  options?: UseMutationOptions<void, unknown, unknown>
): UseMutationResult {
  return useMutation({
    mutationFn: async () => (
      await axios.postForm(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv`,
        {
          csv_data: csv // FileList will be unwrapped as sepate fields
        }
      )
    ).data.data,
    ...options
  });
}

export function useCalculateFinalGrades(
  courseId: Numeric,
  assessmentModelId: Numeric,
  studentNumbers: Array<string>,
  options?: UseMutationOptions<void, unknown, unknown>
): UseMutationResult {
  return useMutation({
    mutationFn: async () => (
      await axios.post(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/calculate`,
        { studentNumbers }
      )
    ).data.data.success,
    ...options
  });
}
