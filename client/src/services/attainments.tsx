// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

import axios from './axios';
import textFormatServices from './textFormat';
import mockAttainmentsClient from '../tests/mock-data/mockAttainmentsClient';
import { AttainmentData } from 'aalto-grades-common/types/attainment';
import { FullResponse, Numeric } from '../types';

// Functions that are (or will be) connected to the server.

async function addAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainment: AttainmentData
): Promise<AttainmentData> {

  const response: FullResponse<{ attainment: AttainmentData }> =
    await axios.post(
      `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/attainments`,
      attainment
    );

  return response.data.data.attainment;
}

async function editAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainment: AttainmentData
): Promise<AttainmentData> {

  const response: FullResponse<{ attainment: AttainmentData }> =
    await axios.put(
      `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
      + `/attainments/${attainment.id}`,
      attainment
    );

  return response.data.data.attainment;
}

async function deleteAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric
): Promise<void> {

  await axios.delete(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
    + `/attainments/${attainmentId}`
  );
}

async function getAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric,
  tree?: 'children' | 'descendants'
): Promise<AttainmentData> {

  const query: string = tree ? `?tree=${tree}` : '';

  const response: FullResponse<{ attainment: AttainmentData }> =
    await axios.get(
      `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
      + `/attainments/${attainmentId}${query}`
    );


  return response.data.data.attainment;
}

export default {
  addAttainment,
  editAttainment,
  deleteAttainment,
  getAttainment
};
