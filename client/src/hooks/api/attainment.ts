// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, NewAttainmentData} from '@common/types/attainment';
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
      (
        await axios.get<{data: AttainmentData[]}>(
          `/v1/courses/${courseId}/attainments`
        )
      ).data.data,
    ...options,
  });

type AddAttainmentVars = {
  courseId: Numeric;
  attainment: NewAttainmentData;
};
type UseAddAttainmentResult = UseMutationResult<
  AttainmentData,
  unknown,
  AddAttainmentVars
>;
export const useAddAttainment = (
  options?: UseMutationOptions<AttainmentData, unknown, AddAttainmentVars>
): UseAddAttainmentResult => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddAttainmentVars) =>
      (
        await axios.post<{data: AttainmentData}>(
          `/v1/courses/${vars.courseId}` + '/attainments',
          vars.attainment
        )
      ).data.data,

    onSuccess: (_data: AttainmentData, vars: AddAttainmentVars) => {
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
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number, unknown, EditAttainmentVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditAttainmentVars) =>
      (
        await axios.put<{id: number}>(
          `/v1/courses/${vars.courseId}/attainments/${vars.attainment.id}`,
          vars.attainment
        )
      ).data.id,

    onSuccess: (_data: number, vars: EditAttainmentVars) => {
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
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number, unknown, DeleteAttainmentVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: DeleteAttainmentVars) =>
      (
        await axios.delete<{id: number}>(
          `/v1/courses/${vars.courseId}/attainments/${vars.attainmentId}`
        )
      ).data.id,

    onSuccess: (_data: number, vars: DeleteAttainmentVars) => {
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
