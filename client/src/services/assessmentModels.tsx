// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { AssessmentModelData } from 'aalto-grades-common/types/attainment';
import { FullResponse, Numeric } from '../types/general';

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
