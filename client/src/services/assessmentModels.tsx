// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { AssessmentModelData, AttainmentData } from 'aalto-grades-common/types/attainment';
import { FullResponse, Numeric } from '../types';

export async function getAllAssessmentModels(
  courseId: Numeric
): Promise<Array<AssessmentModelData>> {

  const response: FullResponse<{ assessmentModels: Array<AssessmentModelData> }> =
    await axios.get(`/v1/courses/${courseId}/assessment-models`);

  return response.data.data.assessmentModels;
}

export async function getAssessmentModel(
  courseId: Numeric,
  assessmentModelId: Numeric
): Promise<AssessmentModelData> {

  const response: FullResponse<{ assessmentModel: AssessmentModelData }> =
    await axios.get(`/v1/courses/${courseId}/assessment-models/${assessmentModelId}`);

  return response.data.data.assessmentModel;
}

export async function addAssessmentModel(
  courseId: Numeric,
  assessmentModel: AssessmentModelData
): Promise<number> {

  const response: FullResponse<{ assessmentModel: { id: number } }> =
    await axios.post(`/v1/courses/${courseId}/assessment-models`, assessmentModel);

  return response.data.data.assessmentModel.id;
}

async function getAllAttainments(
  courseId: Numeric,
  assessmentModelId: Numeric
): Promise<AttainmentData> {

  let response: FullResponse<{ attainment: AttainmentData }>;

  // Brute force some return value until the route for getting all attainments
  // of an assessment model is merged
  for (let i: number = 1; i < 300; i++) {
    try {
      response =
        await axios.get(
          `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
          + `/attainments/${i}?tree=descendants` // TODO: Use proper route
        );

      break;
    } catch {} // eslint-disable-line
  }

  return response.data.data.attainment;
}

export default {
  getAllAssessmentModels, getAssessmentModel, addAssessmentModel, getAllAttainments
};
