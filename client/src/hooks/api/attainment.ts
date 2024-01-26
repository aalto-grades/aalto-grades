// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData} from '@common/types/attainment';
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

export function useGetAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric,
  tree?: 'children' | 'descendants',
  options?: UseQueryOptions<AttainmentData>
): UseQueryResult<AttainmentData> {
  const query: string = tree ? `?tree=${tree}` : '';

  return useQuery({
    queryKey: ['attainment', courseId, assessmentModelId, attainmentId, query],
    queryFn: async () =>
      (
        await axios.get(
          `/v1/courses/${courseId}/assessment-models/${assessmentModelId}` +
            `/attainments/${attainmentId}${query}`
        )
      ).data.data,
    ...options,
  });
}

export function useGetRootAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  tree?: 'children' | 'descendants',
  options?: UseQueryOptions<AttainmentData>
): UseQueryResult<AttainmentData> {
  const query: string = tree ? `?tree=${tree}` : '';

  return useQuery({
    queryKey: ['root-attainment', courseId, assessmentModelId, query],
    queryFn: async () =>
      (
        await axios.get(
          `/v1/courses/${courseId}/assessment-models/${assessmentModelId}` +
            `/attainments${query}`
        )
      ).data.data,
    ...options,
  });
}

interface AddAttainmentVars {
  courseId: Numeric;
  assessmentModelId: Numeric;
  attainment: AttainmentData;
}

export type UseAddAttainmentResult = UseMutationResult<
  AttainmentData,
  unknown,
  AddAttainmentVars
>;

export function useAddAttainment(
  options?: UseMutationOptions<AttainmentData, unknown, unknown>
): UseAddAttainmentResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddAttainmentVars) =>
      (
        await axios.post(
          `/v1/courses/${vars.courseId}` +
            `/assessment-models/${vars.assessmentModelId}` +
            '/attainments',
          vars.attainment
        )
      ).data.data,

    onSuccess: (_data: AttainmentData, vars: AddAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainment', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId, vars.assessmentModelId],
      });
    },
    ...options,
  });
}

interface EditAttainmentVars {
  courseId: Numeric;
  assessmentModelId: Numeric;
  attainment: AttainmentData;
}

export type UseEditAttainmentResult = UseMutationResult<
  AttainmentData,
  unknown,
  AddAttainmentVars
>;

export function useEditAttainment(
  options?: UseMutationOptions<AttainmentData, unknown, unknown>
): UseEditAttainmentResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditAttainmentVars) =>
      (
        await axios.put(
          `/v1/courses/${vars.courseId}` +
            `/assessment-models/${vars.assessmentModelId}` +
            `/attainments/${vars.attainment.id}`,
          vars.attainment
        )
      ).data.data,

    onSuccess: (_data: AttainmentData, vars: EditAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainment', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId, vars.assessmentModelId],
      });
    },
    ...options,
  });
}

interface DeleteAttainmentVars {
  courseId: Numeric;
  assessmentModelId: Numeric;
  attainmentId: Numeric;
}

export type UseDeleteAttainmentResult = UseMutationResult<
  object,
  unknown,
  DeleteAttainmentVars
>;

export function useDeleteAttainment(
  options?: UseMutationOptions<object, unknown, unknown>
): UseDeleteAttainmentResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: DeleteAttainmentVars) =>
      (
        await axios.delete(
          `/v1/courses/${vars.courseId}/assessment-models` +
            `/${vars.assessmentModelId}` +
            `/attainments/${vars.attainmentId}`
        )
      ).data.data,

    onSuccess: (_data: object, vars: DeleteAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainment', vars.courseId, vars.assessmentModelId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId, vars.assessmentModelId],
      });
    },
    ...options,
  });
}
