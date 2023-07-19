// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AssessmentModelData } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationOptions, UseMutationResult,
  useQuery, UseQueryOptions, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useGetAllAssessmentModels(
  courseId: Numeric,
  options?: UseQueryOptions<Array<AssessmentModelData>>
): UseQueryResult<Array<AssessmentModelData>> {
  return useQuery({
    queryKey: ['all-assessment-models', courseId],
    queryFn: async () => (
      await axios.get(`/v1/courses/${courseId}/assessment-models`)
    ).data.data.assessmentModels,
    ...options
  });
}

export function useGetAssessmentModel(
  courseId: Numeric,
  assessmentModelId: Numeric,
  options?: UseQueryOptions<AssessmentModelData>
): UseQueryResult<AssessmentModelData> {
  return useQuery({
    queryKey: ['assessment-model', courseId, assessmentModelId],
    queryFn: async () => (
      await axios.get(`/v1/courses/${courseId}/assessment-models/${assessmentModelId}`)
    ).data.data.assessmentModel,
    ...options
  });
}

export function useAddAssessmentModel(
  courseId: Numeric,
  assessmentModel: AssessmentModelData,
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number> {
  return useMutation({
    mutationFn: async () => (
      await axios.post(`/v1/courses/${courseId}/assessment-models`, assessmentModel)
    ).data.data.assessmentModel.id,
    ...options
  });
}
