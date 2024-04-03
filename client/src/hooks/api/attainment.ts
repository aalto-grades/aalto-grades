// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {IdSchema} from '@common/types';
import {
  AttainmentData,
  AttainmentDataArraySchema,
  NewAttainmentData,
} from '@common/types/attainment';
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

type AddAttainmentVars = {
  courseId: Numeric;
  attainment: NewAttainmentData;
};
export const useAddAttainment = (
  options?: UseMutationOptions<number, unknown, AddAttainmentVars>
): UseMutationResult<number, unknown, AddAttainmentVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddAttainmentVars) =>
      IdSchema.parse(
        (
          await axios.post(
            `/v1/courses/${vars.courseId}` + '/attainments',
            vars.attainment
          )
        ).data
      ),

    onSuccess: (_data: number, vars: AddAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', vars.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId],
      });
    },
    ...options,
  });
};

type EditAttainmentVars = {courseId: Numeric; attainment: AttainmentData};
export const useEditAttainment = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, EditAttainmentVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditAttainmentVars) =>
      await axios.put(
        `/v1/courses/${vars.courseId}/attainments/${vars.attainment.id}`,
        vars.attainment
      ),

    onSuccess: (_data: unknown, vars: EditAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', vars.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId],
      });
    },
    ...options,
  });
};

type DeleteAttainmentVars = {courseId: Numeric; attainmentId: Numeric};
export const useDeleteAttainment = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, DeleteAttainmentVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: DeleteAttainmentVars) =>
      await axios.delete(
        `/v1/courses/${vars.courseId}/attainments/${vars.attainmentId}`
      ),

    onSuccess: (_data: unknown, vars: DeleteAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', vars.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId],
      });
    },
    ...options,
  });
};
