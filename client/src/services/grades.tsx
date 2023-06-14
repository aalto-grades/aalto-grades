// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

async function exportSisuCsv(
  courseId: number | string, instanceId: number | string, params: unknown
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
  courseId: number | string, instanceId: number | string, csv: unknown
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
  courseId: number | string, instanceId: number | string
) {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv`
  );
  return response;
}

export async function calculateFinalGrades(
  courseId: number | string, instanceId: number | string
) {
  const response = await axios.post(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/calculate`
  );
  return response.data.success;
}

export async function getFinalGrades(
  courseId: number | string, instanceId: number | string
) {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades`
  );
  return response.data.data;
}

export default { calculateFinalGrades, exportSisuCsv, getFinalGrades, importCsv, downloadCsvTemplate };
