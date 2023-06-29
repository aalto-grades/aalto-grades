// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { Numeric } from '../types';

async function exportSisuCsv(
  courseId: Numeric, instanceId: Numeric, params: unknown
): Promise<BlobPart> {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv/sisu`,
    {
      responseType: 'blob',
      params
    }
  );
  return response.data;
}

async function importCsv(
  courseId: Numeric, instanceId: Numeric, csv: unknown
) {
  const response = await axios.postForm(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv`,
    {
      csv_data: csv // FileList will be unwrapped as sepate fields
    }
  );
  return response.data.data;
}

async function downloadCsvTemplate(
  courseId: Numeric, instanceId: Numeric
) {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv`
  );
  return response;
}

export async function calculateFinalGrades(
  courseId: Numeric, instanceId: Numeric
) {
  const response = await axios.post(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/calculate`
  );
  return response.data.success;
}

export async function getFinalGrades(
  courseId: Numeric, instanceId: Numeric
) {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades`
  );
  return response.data.data;
}

export default {
  calculateFinalGrades, exportSisuCsv, getFinalGrades, importCsv, downloadCsvTemplate
};
