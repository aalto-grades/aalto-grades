// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationResult, useQuery, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useDownloadCsvTemplate(
  courseId: Numeric, assessmentModelId: Numeric
): UseQueryResult<string> {
  return useQuery({
    queryKey: ['download-csv-template', courseId, assessmentModelId],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv`
      )
    ).data
  });
}

export function useExportSisuGradeCsv(
  courseId: Numeric, assessmentModelId: Numeric, params: unknown
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
    ).data
  });
}

export function useGetFinalGrades(
  courseId: Numeric, assessmentModelId: Numeric
): UseQueryResult<Array<FinalGrade>> {
  return useQuery({
    queryKey: ['final-grades', courseId, assessmentModelId],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades`
      )
    ).data.data.finalGrades
  });
}

export function useUploadGradeCsv(
  courseId: Numeric, assessmentModelId: Numeric, csv: unknown
): UseMutationResult {
  return useMutation({
    mutationFn: async () => (
      await axios.postForm(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv`,
        {
          csv_data: csv // FileList will be unwrapped as sepate fields
        }
      )
    ).data.data
  });
}

export function useCalculateFinalGrades(
  courseId: Numeric, assessmentModelId: Numeric, studentNumbers: Array<string>
): UseMutationResult {
  return useMutation({
    mutationFn: async () => (
      await axios.post(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/calculate`,
        { studentNumbers }
      )
    ).data.data.success
  });
}
