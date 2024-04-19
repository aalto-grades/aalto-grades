// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AssessmentModelData,
  AssessmentModelDataArraySchema,
  AssessmentModelDataSchema,
  EditAssessmentModelData,
  IdSchema,
  NewAssessmentModelData,
} from '@common/types';
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
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
      AssessmentModelDataArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/assessment-models`)).data
      ),
    ...options,
  });

export const useGetAssessmentModel = (
  courseId: Numeric,
  assessmentModelId: Numeric,
  options?: Partial<UseQueryOptions<AssessmentModelData>>
): UseQueryResult<AssessmentModelData> =>
  useQuery({
    queryKey: ['assessment-model', courseId, assessmentModelId],
    queryFn: async () =>
      AssessmentModelDataSchema.parse(
        (
          await axios.get(
            `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
          )
        ).data
      ),
    ...options,
  });

type AddAssessmentModelVars = {
  courseId: Numeric;
  assessmentModel: NewAssessmentModelData;
};
export const useAddAssessmentModel = (
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number, unknown, AddAssessmentModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddAssessmentModelVars) =>
      IdSchema.parse(
        (
          await axios.post(
            `/v1/courses/${vars.courseId}/assessment-models`,
            vars.assessmentModel
          )
        ).data
      ),

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
  assessmentModel: EditAssessmentModelData;
};
export const useEditAssessmentModel = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, EditAssessmentModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditAssessmentModelVars) =>
      await axios.put(
        `/v1/courses/${vars.courseId}/assessment-models/${vars.assessmentModelId}`,
        vars.assessmentModel
      ),

    onSuccess: (_data: unknown, vars: EditAssessmentModelVars) => {
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
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, DeleteAssessmentModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: DeleteAssessmentModelVars) =>
      await axios.delete(
        `/v1/courses/${vars.courseId}/assessment-models/${vars.assessmentModelId}`
      ),

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
