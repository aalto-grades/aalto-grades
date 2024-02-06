// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AssessmentModelData} from '@common/types';
import axios from './axios';
import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import {Numeric} from '../../types';

export function useGetAllAssessmentModels(
  courseId: Numeric,
  options?: Partial<UseQueryOptions<Array<AssessmentModelData>>>
): UseQueryResult<Array<AssessmentModelData>> {
  return useQuery({
    queryKey: ['all-assessment-models', courseId],
    queryFn: async () =>
      (await axios.get(`/v1/courses/${courseId}/assessment-models`)).data.data,
    ...options,
  });
}

export function useGetAssessmentModel(
  courseId: Numeric,
  assessmentModelId: Numeric,
  options?: Partial<UseQueryOptions<AssessmentModelData>>
): UseQueryResult<AssessmentModelData> {
  return useQuery({
    queryKey: ['assessment-model', courseId, assessmentModelId],
    queryFn: async () =>
      (
        await axios.get(
          `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
        )
      ).data.data,
    ...options,
  });
}

interface AddAssessmentModelVars {
  courseId: Numeric;
  assessmentModel: AssessmentModelData;
}

export type UseAddAssessmentModelResult = UseMutationResult<
  number,
  unknown,
  AddAssessmentModelVars
>;

export function useAddAssessmentModel(
  options?: UseMutationOptions<number, unknown, unknown>
): UseAddAssessmentModelResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddAssessmentModelVars) =>
      (
        await axios.post(
          `/v1/courses/${vars.courseId}/assessment-models`,
          vars.assessmentModel
        )
      ).data.data,

    onSuccess: (_data: number, vars: AddAssessmentModelVars) => {
      queryClient.invalidateQueries({
        queryKey: ['all-assessment-models', vars.courseId],
      });
    },
    ...options,
  });
}
