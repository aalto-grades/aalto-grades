// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, NewAttainmentData} from '@common/types/attainment';
import {
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from './axios';

import {Numeric} from '../../types';

export function useGetAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric,
  tree?: 'children' | 'descendants',
  options?: Partial<UseQueryOptions<AttainmentData>>
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
  options?: Partial<UseQueryOptions<AttainmentData>>
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

export function useGetAttainments(
  courseId: Numeric,
  options?: Partial<UseQueryOptions<Array<AttainmentData>>>
): UseQueryResult<Array<AttainmentData>> {
  return useQuery({
    queryKey: ['attainments', courseId],
    queryFn: async () =>
      (await axios.get(`/v1/courses/${courseId}/attainments`)).data.data,
    ...options,
  });
}

// interface AddAttainmentVars {
//   courseId: Numeric;
//   assessmentModelId: Numeric;
//   attainment: AttainmentData;
// }

// export type UseAddAttainmentResult = UseMutationResult<
//   AttainmentData,
//   unknown,
//   AddAttainmentVars
// >;

// export function useAddAttainment(
//   options?: UseMutationOptions<AttainmentData, unknown, unknown>
// ): UseAddAttainmentResult {
//   const queryClient: QueryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (vars: AddAttainmentVars) =>
//       (
//         await axios.post(
//           `/v1/courses/${vars.courseId}` +
//             `/assessment-models/${vars.assessmentModelId}` +
//             '/attainments',
//           vars.attainment
//         )
//       ).data.data,

//     onSuccess: (_data: AttainmentData, vars: AddAttainmentVars) => {
//       queryClient.invalidateQueries({
//         queryKey: ['attainment', vars.courseId, vars.assessmentModelId],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ['root-attainment', vars.courseId, vars.assessmentModelId],
//       });
//     },
//     ...options,
//   });
// }

type AddAttainmentVars = {
  courseId: Numeric;
  attainment: NewAttainmentData;
};

export type UseAddAttainmentResult = UseMutationResult<
  AttainmentData,
  unknown,
  AddAttainmentVars
>;

// export function useAddAttainment(
//   options?: UseMutationOptions<AttainmentData, unknown, AddAttainmentVars>
// ): UseAddAttainmentResult {
//   const queryClient: QueryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (vars: AddAttainmentVars) =>
//       (
//         await axios.post(
//           `/v1/courses/${vars.courseId}` + '/attainments',
//           vars.attainment
//         )
//       ).data.data,

//     onSuccess: (_data: AttainmentData, vars: AddAttainmentVars) => {
//       queryClient.invalidateQueries({
//         queryKey: ['attainments', vars.courseId],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ['root-attainment', vars.courseId],
//       });
//     },
//     ...options,
//   });
// }

export function useAddAttainment(
  options?: UseMutationOptions<AttainmentData, unknown, AddAttainmentVars>
): UseAddAttainmentResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddAttainmentVars) =>
      (
        await axios.post(
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
}

interface EditAttainmentVars {
  courseId: Numeric;
  attainment: AttainmentData;
}

export type UseEditAttainmentResult = UseMutationResult<
  AttainmentData,
  unknown,
  EditAttainmentVars
>;

export function useEditAttainment(
  options?: UseMutationOptions<AttainmentData, unknown, unknown>
): UseEditAttainmentResult {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditAttainmentVars) =>
      (
        await axios.put(
          `/v1/courses/${vars.courseId}/attainments/${vars.attainment.id}`,
          vars.attainment
        )
      ).data.data,

    onSuccess: (_data: AttainmentData, vars: EditAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', vars.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId],
      });
    },
    ...options,
  });
}

interface DeleteAttainmentVars {
  courseId: Numeric;
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
          `/v1/courses/${vars.courseId}/attainments/${vars.attainmentId}`
        )
      ).data.data,

    onSuccess: (_data: object, vars: DeleteAttainmentVars) => {
      queryClient.invalidateQueries({
        queryKey: ['attainments', vars.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['root-attainment', vars.courseId],
      });
    },
    ...options,
  });
}
