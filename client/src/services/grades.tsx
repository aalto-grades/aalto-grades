// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

async function exportSisuCsv(
  courseId: number, instanceId: number, params
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

async function importCsv(courseId: number, instanceId: number, csv) {
  const response = await axios.postForm(`/v1/courses/${courseId}/instances/${instanceId}/grades/csv`, {
    csv_data: csv // FileList will be unwrapped as sepate fields
  });
  return response.data.data;
}

export default { exportSisuCsv, importCsv };
