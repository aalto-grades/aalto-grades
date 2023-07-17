// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import {
  useMutation, UseMutationResult, useQuery, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

// TODO

export function useDownloadCsvTemplate(
  courseId: Numeric, instanceId: Numeric
): UseQueryResult {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv`
  );
  return response;
}

export function useExportSisuCsv(
  courseId: Numeric, instanceId: Numeric, params: unknown
): UseQueryResult<BlobPart> {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv/sisu`,
    {
      responseType: 'blob',
      params
    }
  );
  return response.data;
}

export function useGetFinalGrades(
  courseId: Numeric, instanceId: Numeric
): UseQueryResult {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades`
  );
  return response.data.data;
}

export function useImportCsv(
  courseId: Numeric, instanceId: Numeric, csv: unknown
): UseMutationResult {
  const response = await axios.postForm(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv`,
    {
      csv_data: csv // FileList will be unwrapped as sepate fields
    }
  );
  return response.data.data;
}

export function useCalculateFinalGrades(
  courseId: Numeric, instanceId: Numeric
): UseMutationResult {
  const response = await axios.post(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/calculate`
  );
  return response.data.success;
}


