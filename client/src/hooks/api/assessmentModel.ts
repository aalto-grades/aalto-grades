// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AssessmentModelData} from '@common/types';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {Numeric} from '../../types';
import axios from './axios';

export const useGetAllAssessmentModels = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<AssessmentModelData[]>>
): UseQueryResult<AssessmentModelData[]> =>
  useQuery({
    queryKey: ['all-assessment-models', courseId],
    queryFn: async () =>
      (
        await axios.get<{data: AssessmentModelData[]}>(
          `/v1/courses/${courseId}/assessment-models`
        )
      ).data.data,
    ...options,
  });

export const useGetAssessmentModel = (
  courseId: Numeric,
  assessmentModelId: Numeric,
  options?: Partial<UseQueryOptions<AssessmentModelData>>
): UseQueryResult<AssessmentModelData> => {
  return useQuery({
    queryKey: ['assessment-model', courseId, assessmentModelId],
    queryFn: async () =>
      (
        await axios.get<{data: AssessmentModelData}>(
          `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
        )
      ).data.data,
    ...options,
  });
};

type AddAssessmentModelVars = {
  courseId: Numeric;
  assessmentModel: AssessmentModelData;
};
export const useAddAssessmentModel = (
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number, unknown, AddAssessmentModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddAssessmentModelVars) =>
      (
        await axios.post<{data: number}>(
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
};

type EditAssessmentModelVars = {
  courseId: Numeric;
  assessmentModelId: Numeric;
  assessmentModel: AssessmentModelData;
};
export const useEditAssessmentModel = (
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number, unknown, EditAssessmentModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditAssessmentModelVars) =>
      (
        await axios.put<{id: number}>(
          `/v1/courses/${vars.courseId}/assessment-models/${vars.assessmentModelId}`,
          vars.assessmentModel
        )
      ).data.id,

    onSuccess: (_data: number, vars: EditAssessmentModelVars) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-model', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-assessment-models', vars.courseId],
      });
    },
    ...options,
  });
};

type DeleteAssessmentModelVars = {
  courseId: Numeric;
  assessmentModelId: Numeric;
};
export const useDeleteAssessmentModel = (
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number, unknown, DeleteAssessmentModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: DeleteAssessmentModelVars) =>
      (
        await axios.delete<{id: number}>(
          `/v1/courses/${vars.courseId}/assessment-models/${vars.assessmentModelId}`
        )
      ).data.id,

    onSuccess: (_data: unknown, vars: DeleteAssessmentModelVars) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-model', vars.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-assessment-models', vars.courseId],
      });
    },
    ...options,
  });
};
