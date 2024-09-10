// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type EditGradingModelData,
  type GradingModelData,
  GradingModelDataArraySchema,
  GradingModelDataSchema,
  IdSchema,
  type NewGradingModelData,
} from '@/common/types';
import type {Numeric} from '@/types';
import axios from './axios';

export const useGetAllGradingModels = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<GradingModelData[]>>
): UseQueryResult<GradingModelData[]> =>
  useQuery({
    queryKey: ['all-grading-models', courseId],
    queryFn: async () =>
      GradingModelDataArraySchema.parse(
        (await axios.get(`/api/v1/courses/${courseId}/grading-models`)).data
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
            `/api/v1/courses/${courseId}/grading-models/${gradingModelId}`
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
  options?: UseMutationOptions<number, unknown, AddGradingModelVars>
): UseMutationResult<number, unknown, AddGradingModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async vars =>
      IdSchema.parse(
        (
          await axios.post(
            `/api/v1/courses/${vars.courseId}/grading-models`,
            vars.gradingModel
          )
        ).data
      ),

    onSuccess: (_data, vars) => {
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
  options?: UseMutationOptions<void, unknown, EditGradingModelVars>
): UseMutationResult<void, unknown, EditGradingModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async vars =>
      axios.put(
        `/api/v1/courses/${vars.courseId}/grading-models/${vars.gradingModelId}`,
        vars.gradingModel
      ),

    onSuccess: (_data, vars) => {
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
  options?: UseMutationOptions<void, unknown, DeleteGradingModelVars>
): UseMutationResult<void, unknown, DeleteGradingModelVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async vars =>
      axios.delete(
        `/api/v1/courses/${vars.courseId}/grading-models/${vars.gradingModelId}`
      ),

    onSuccess: (_data, vars) => {
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
