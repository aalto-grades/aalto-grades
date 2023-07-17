// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';

import axios from './axios';
import { FullResponse, Numeric } from '../types';

export async function addAttainment(
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

export async function editAttainment(
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

export async function deleteAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric
): Promise<void> {

  await axios.delete(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
    + `/attainments/${attainmentId}`
  );
}

export async function getAttainment(
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

export async function getAllAttainments(
  courseId: Numeric,
  assessmentModelId: Numeric,
  tree?: 'children' | 'descendants'
): Promise<AttainmentData> {

  const query: string = tree ? `?tree=${tree}` : '';

  const response: FullResponse<{ attainment: AttainmentData }> =
    await axios.get(
      `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/attainments${query}`
    );

  return response.data.data.attainment;
}
