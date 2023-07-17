// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { FinalGrade } from 'aalto-grades-common/types';
import { FullResponse, Numeric } from '../types';
import { AxiosResponse } from 'axios';

export async function exportSisuCsv(
  courseId: Numeric, assessmentModelId: Numeric, params: unknown
): Promise<BlobPart> {
  const response: AxiosResponse = await axios.get(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv/sisu`,
    {
      responseType: 'blob',
      params
    }
  );
  return response.data;
}

export async function importCsv(
  courseId: Numeric, assessmentModelId: Numeric, csv: unknown
): Promise<unknown> {
  const response: FullResponse<unknown> = await axios.postForm(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv`,
    {
      csv_data: csv // FileList will be unwrapped as sepate fields
    }
  );
  return response.data.data;
}

export async function downloadCsvTemplate(
  courseId: Numeric, assessmentModelId: Numeric
): Promise<string> {
  const response: AxiosResponse = await axios.get(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/csv`
  );
  return response.data;
}

export async function calculateFinalGrades(
  courseId: Numeric, assessmentModelId: Numeric, studentNumbers: Array<string>
): Promise<boolean> {
  const response: FullResponse<unknown> = await axios.post(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades/calculate`,
    { studentNumbers }
  );
  return response.data.success;
}

export async function getFinalGrades(
  courseId: Numeric, assessmentModelId: Numeric
): Promise<Array<FinalGrade>> {
  const response: FullResponse<{ finalGrades: Array<FinalGrade> }> = await axios.get(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/grades`
  );
  return response.data.data.finalGrades;
}
