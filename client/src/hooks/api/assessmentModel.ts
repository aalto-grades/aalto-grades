// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  GradingModelData,
  GradingModelDataArraySchema,
  GradingModelDataSchema,
  EditGradingModelData,
  IdSchema,
  NewGradingModelData,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetAllGradingModels = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<GradingModelData[]>>
): UseQueryResult<GradingModelData[]> =>
  useQuery({
    queryKey: ['all-grading-models', courseId],
    queryFn: async () =>
      GradingModelDataArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/grading-models`)).data
      ),
    ...options,
  });

export const useGetGradingModel = (
  courseId: Numeric,
  gradingModelId: Numeric,
  options?: Partial<UseQueryOptions<GradingModelData>>
): UseQueryResult<GradingModelData> =>
  useQuery({
    queryKey: ['grading-model', courseId, gradingModelId],
    queryFn: async () =>
      GradingModelDataSchema.parse(
        (
          await axios.get(
            `/v1/courses/${courseId}/grading-models/${gradingModelId}`
          )
        ).data
      ),
    ...options,
  });

type AddGradingModelVars = {
  courseId: Numeric;
  gradingModel: NewGradingModelData;
};
export const useAddGradingModel = (
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number, unknown, AddGradingModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddGradingModelVars) =>
      IdSchema.parse(
        (
          await axios.post(
            `/v1/courses/${vars.courseId}/grading-models`,
            vars.gradingModel
          )
        ).data
      ),

    onSuccess: (_data: number, vars: AddGradingModelVars) => {
      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', vars.courseId],
      });
    },
    ...options,
  });
};

type EditGradingModelVars = {
  courseId: Numeric;
  gradingModelId: Numeric;
  gradingModel: EditGradingModelData;
};
export const useEditGradingModel = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, EditGradingModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditGradingModelVars) =>
      await axios.put(
        `/v1/courses/${vars.courseId}/grading-models/${vars.gradingModelId}`,
        vars.gradingModel
      ),

    onSuccess: (_data: unknown, vars: EditGradingModelVars) => {
      queryClient.invalidateQueries({
        queryKey: ['grading-model', vars.courseId, vars.gradingModelId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', vars.courseId],
      });
    },
    ...options,
  });
};

type DeleteGradingModelVars = {
  courseId: Numeric;
  gradingModelId: Numeric;
};
export const useDeleteGradingModel = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, DeleteGradingModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: DeleteGradingModelVars) =>
      await axios.delete(
        `/v1/courses/${vars.courseId}/grading-models/${vars.gradingModelId}`
      ),

    onSuccess: (_data: unknown, vars: DeleteGradingModelVars) => {
      queryClient.invalidateQueries({
        queryKey: ['grading-model', vars.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', vars.courseId],
      });
    },
    ...options,
  });
};
