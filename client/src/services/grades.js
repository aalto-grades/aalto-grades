// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const exportSisuCsv = async (courseId, instanceId, params) => {
  const response = await axios.get(
    `/v1/courses/${courseId}/instances/${instanceId}/grades/csv/sisu`,
    {
      responseType: 'blob',
      params
    }
  );
  return response.data;
};

const importCsv = async (courseId, instanceId, csv) => {
  const response = await axios.postForm(`/v1/courses/${courseId}/instances/${instanceId}/grades/csv`, {
    csv_data: csv // FileList will be unwrapped as sepate fields
  });
  return response.data.data;
};

export default { exportSisuCsv, importCsv };