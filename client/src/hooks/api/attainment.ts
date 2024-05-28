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

import {IdSchema} from '@/common/types';
import {
  AttainmentData,
  AttainmentDataArraySchema,
  EditAttainmentData,
  NewAttainmentData,
} from '@/common/types/attainment';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetAttainments = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<AttainmentData[]>>
): UseQueryResult<AttainmentData[]> =>
  useQuery({
    queryKey: ['attainments', courseId],
    queryFn: async () =>
      AttainmentDataArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/attainments`)).data
      ),
    ...options,
  });

export const useAddAttainment = (
  courseId: Numeric,
  options?: UseMutationOptions<number, unknown, NewAttainmentData>
): UseMutationResult<number, unknown, NewAttainmentData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (att: NewAttainmentData) =>
      IdSchema.parse(
        (await axios.post(`/v1/courses/${courseId}/attainments`, att)).data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', courseId],
      });
    },
    ...options,
  });
};

type EditAttainmentVars = {
  attainmentId: Numeric;
  attainment: EditAttainmentData;
};
export const useEditAttainment = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, EditAttainmentVars>
): UseMutationResult<unknown, unknown, EditAttainmentVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditAttainmentVars) =>
      await axios.put(
        `/v1/courses/${courseId}/attainments/${vars.attainmentId}`,
        vars.attainment
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', courseId],
      });
    },
    ...options,
  });
};

export const useDeleteAttainment = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, Numeric>
): UseMutationResult<unknown, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attainmentId: Numeric) =>
      await axios.delete(`/v1/courses/${courseId}/attainments/${attainmentId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', courseId],
      });
    },
    ...options,
  });
};
